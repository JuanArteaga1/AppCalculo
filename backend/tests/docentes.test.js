import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import Usuario from "../schemas/usuarios.js";
import { arrancarBackend, buscarUsuario, conectarBase, crearUsuario, ingresar, limpiarYDesconectar } from "./apoyo.js";

let backend;
let admin;
const ids = [];

async function pedir(ruta, { metodo = "GET", cuerpo, cookie } = {}) {
    const respuesta = await fetch(`${backend.base}${ruta}`, {
        method: metodo,
        headers: { ...(cuerpo ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    return { estado: respuesta.status, cuerpo: await respuesta.json().catch(() => null) };
}

async function conSesion(rol) {
    const { correo, clave } = await crearUsuario({ rol });
    ids.push((await buscarUsuario(correo))._id);
    return (await ingresar(backend.base, correo, clave)).cookie;
}

before(async () => {
    await conectarBase();
    backend = await arrancarBackend(5190);
    admin = await conSesion("administrador");
});

after(async () => {
    await Usuario.deleteMany({ _id: { $in: ids } });
    backend?.detener();
    await limpiarYDesconectar();
});

test("CA-01: el administrador lista solo docentes", async () => {
    await Usuario.create({
        nombre: "Docente de prueba",
        correo: "docente.listado@uniautonoma.edu.co",
        rol: "docente",
        estado: "activo",
        modulosAsignados: ["limites"],
        ingresos: 3,
        ultimoIngreso: new Date(),
    });

    const respuesta = await pedir("/admin/docentes", { cookie: admin });
    assert.equal(respuesta.estado, 200);
    assert.ok(Array.isArray(respuesta.cuerpo.docentes));
    const docente = respuesta.cuerpo.docentes.find((d) => d.correo === "docente.listado@uniautonoma.edu.co");
    assert.ok(docente);
    assert.equal(docente.rol, undefined);
    assert.equal(docente.contrasena, undefined);
    assert.equal(docente.estado, "activo");
    assert.deepEqual(docente.modulosAsignados, ["limites"]);
});

test("CA-02: estudiante y docente no pueden listar docentes", async () => {
    const estudiante = await conSesion("estudiante");
    const docente = await conSesion("docente");

    const respuestaEstudiante = await pedir("/admin/docentes", { cookie: estudiante });
    assert.equal(respuestaEstudiante.estado, 403);
    assert.equal(respuestaEstudiante.cuerpo.error, "SIN_PERMISO");

    const respuestaDocente = await pedir("/admin/docentes", { cookie: docente });
    assert.equal(respuestaDocente.estado, 403);
    assert.equal(respuestaDocente.cuerpo.error, "SIN_PERMISO");
});
