import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import Usuario from "../schemas/usuarios.js";
import { arrancarBackend, buscarUsuario, conectarBase, crearUsuario, ingresar, limpiarYDesconectar, quienSoy } from "./apoyo.js";

// Menos de 10 ingresos en total: el límite por IP es de 10 cada 15 minutos.
let backend;

before(async () => {
    await conectarBase();
    backend = await arrancarBackend(5197);
});

after(async () => {
    backend?.detener();
    await limpiarYDesconectar();
});

test("CA-01: un usuario activo ingresa y su sesión trae su rol", async () => {
    const { correo, clave } = await crearUsuario({ rol: "docente" });
    const ingreso = await ingresar(backend.base, correo, clave);

    assert.equal(ingreso.estado, 200);
    assert.equal(ingreso.cuerpo.usuario.rol, "docente");
    assert.equal(JSON.stringify(ingreso.cuerpo).includes("contrasena"), false);

    const yo = await quienSoy(backend.base, ingreso.cookie);
    assert.equal(yo.estado, 200);
    assert.equal(yo.cuerpo.usuario.rol, "docente");
});

test("CA-04: una cuenta inactiva no entra y conserva su información", async () => {
    const { correo, clave } = await crearUsuario({ estado: "inactivo" });

    const conClave = await ingresar(backend.base, correo, clave);
    assert.equal(conClave.estado, 403);
    assert.equal(conClave.cuerpo.error, "CUENTA_INACTIVA");
    assert.equal(conClave.cookie, null);

    // Sin la contraseña correcta no se revela el estado (BR-06).
    const sinClave = await ingresar(backend.base, correo, "otra-clave-cualquiera");
    assert.equal(sinClave.estado, 401);
    assert.equal(sinClave.cuerpo.error, "CREDENCIALES_INVALIDAS");

    assert.ok(await buscarUsuario(correo));
});

test("BR-06: un correo que no existe recibe el mismo mensaje que una clave incorrecta", async () => {
    const { correo } = await crearUsuario();
    const inexistente = await ingresar(backend.base, "test.login.no-existe@uniautonoma.edu.co", "lo-que-sea-123");
    const claveMala = await ingresar(backend.base, correo, "lo-que-sea-123");

    assert.equal(inexistente.estado, 401);
    assert.deepEqual(inexistente.cuerpo, claveMala.cuerpo);
});

test("CA-12 (mecanismo): subir la versión de sesión cierra las sesiones abiertas", async () => {
    const { correo, clave } = await crearUsuario();
    const { cookie } = await ingresar(backend.base, correo, clave);
    assert.equal((await quienSoy(backend.base, cookie)).estado, 200);

    await Usuario.updateOne({ correo }, { $inc: { versionSesion: 1 } });

    const despues = await quienSoy(backend.base, cookie);
    assert.equal(despues.estado, 401);
    assert.equal(despues.cuerpo.error, "SESION_INVALIDA");
});

test("CA-13: la sesión dura 8 horas y una vencida pide ingresar de nuevo", async () => {
    const { correo, clave } = await crearUsuario();
    const { cookie } = await ingresar(backend.base, correo, clave);
    const { exp, iat } = jwt.decode(cookie.split("=")[1]);
    assert.equal(exp - iat, 8 * 60 * 60);

    const usuario = await buscarUsuario(correo);
    const vencido = jwt.sign({ id: String(usuario._id), v: 0, exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET);
    const respuesta = await quienSoy(backend.base, `sesion=${vencido}`);
    assert.equal(respuesta.estado, 401);
    assert.equal(respuesta.cuerpo.error, "SESION_VENCIDA");
});

test("CA-14: cada ingreso suma a la frecuencia de uso y guarda el último", async () => {
    const { correo, clave } = await crearUsuario();
    const antes = Date.now();

    await ingresar(backend.base, correo, clave);
    await ingresar(backend.base, correo, clave);

    const usuario = await buscarUsuario(correo);
    assert.equal(usuario.ingresos, 2);
    assert.ok(usuario.ultimoIngreso.getTime() >= antes - 1000);
});
