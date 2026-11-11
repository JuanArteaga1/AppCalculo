import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import Usuario from "../schemas/usuarios.js";
import { arrancarBackend, buscarUsuario, conectarBase, crearUsuario, ingresar, limpiarYDesconectar } from "./apoyo.js";

// Archivo aparte: sus 7 ingresos no deben sumar al límite por IP de login.test.js.
let backend;

before(async () => {
    await conectarBase();
    backend = await arrancarBackend(5198);
});

after(async () => {
    backend?.detener();
    await limpiarYDesconectar();
});

test("CA-10: 5 intentos fallidos bloquean la cuenta 15 minutos, con un mensaje propio", async () => {
    const { correo, clave } = await crearUsuario();

    for (let i = 0; i < 4; i += 1) {
        const fallo = await ingresar(backend.base, correo, "clave-equivocada");
        assert.equal(fallo.estado, 401);
        assert.equal(fallo.cuerpo.error, "CREDENCIALES_INVALIDAS");
        assert.equal(fallo.cuerpo.descripcion, "Correo o contraseña incorrectos.");
    }

    // El quinto fallo ya avisa del bloqueo.
    const quinto = await ingresar(backend.base, correo, "clave-equivocada");
    assert.equal(quinto.estado, 423);
    assert.equal(quinto.cuerpo.error, "CUENTA_BLOQUEADA");
    assert.match(quinto.cuerpo.descripcion, /15 minutos/);

    const bloqueado = await buscarUsuario(correo);
    const minutos = (bloqueado.bloqueadoHasta.getTime() - Date.now()) / 60000;
    assert.ok(minutos > 14 && minutos <= 15);

    // Con la clave correcta tampoco entra mientras dure el bloqueo.
    const durante = await ingresar(backend.base, correo, clave);
    assert.equal(durante.estado, 423);
    assert.equal(durante.cuerpo.error, "CUENTA_BLOQUEADA");
    assert.equal(durante.cookie, null);

    // Pasado el bloqueo (simulado moviendo la hora límite), entra.
    await Usuario.updateOne({ correo }, { $set: { bloqueadoHasta: new Date(Date.now() - 1000) } });
    assert.equal((await ingresar(backend.base, correo, clave)).estado, 200);
});
