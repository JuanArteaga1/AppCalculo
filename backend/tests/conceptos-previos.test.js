import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import ConceptoPrevio from "../schemas/conceptosPrevios.js";
import { arrancarBackend, buscarUsuario, conectarBase, crearUsuario, ingresar, limpiarYDesconectar } from "./apoyo.js";

// spec-conceptos-previos: CRUD admin, listado/detalle público y permisos.
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
    backend = await arrancarBackend(5191);
    admin = await conSesion("administrador");
});

after(async () => {
    await ConceptoPrevio.deleteMany({});
    backend?.detener();
    await limpiarYDesconectar();
});

test("CA-01: el administrador lista todos los conceptos previos ordenados", async () => {
    await ConceptoPrevio.create({
        titulo: "Concepto A",
        slug: "concepto-a",
        contenido: [{ id: "b1", tipo: "texto", texto: "Hola" }],
        orden: 2,
        publicado: true,
    });
    await ConceptoPrevio.create({
        titulo: "Concepto B",
        slug: "concepto-b",
        contenido: [],
        orden: 1,
        publicado: false,
    });

    const respuesta = await pedir("/admin/conceptos-previos", { cookie: admin });
    assert.equal(respuesta.estado, 200);
    assert.equal(respuesta.cuerpo.conceptos.length, 2);
    assert.equal(respuesta.cuerpo.conceptos[0].slug, "concepto-b");
    assert.equal(respuesta.cuerpo.conceptos[1].slug, "concepto-a");
});

test("CA-02 y CA-03: el administrador crea un concepto previo con bloques validados", async () => {
    const respuesta = await pedir("/admin/conceptos-previos", {
        metodo: "POST",
        cookie: admin,
        cuerpo: {
            titulo: "Nuevo concepto",
            slug: "nuevo-concepto",
            orden: 1,
            contenido: [{ id: "b1", tipo: "texto", texto: "Texto de ejemplo." }],
        },
    });

    assert.equal(respuesta.estado, 201);
    assert.equal(respuesta.cuerpo.concepto.slug, "nuevo-concepto");
    assert.equal(respuesta.cuerpo.concepto.publicado, false);
    assert.equal(respuesta.cuerpo.concepto.contenido.length, 1);
});

test("CA-03: el backend rechaza slug duplicado", async () => {
    await ConceptoPrevio.create({ titulo: "Existente", slug: "duplicado", contenido: [], orden: 1 });

    const respuesta = await pedir("/admin/conceptos-previos", {
        metodo: "POST",
        cookie: admin,
        cuerpo: { titulo: "Otro", slug: "duplicado", orden: 2, contenido: [] },
    });

    assert.equal(respuesta.estado, 409);
    assert.equal(respuesta.cuerpo.error, "SLUG_DUPLICADO");
});

test("CA-03: el backend rechaza bloques de tipo desconocido", async () => {
    const respuesta = await pedir("/admin/conceptos-previos", {
        metodo: "POST",
        cookie: admin,
        cuerpo: { titulo: "Malo", slug: "malo", orden: 1, contenido: [{ id: "b1", tipo: "desconocido" }] },
    });

    assert.equal(respuesta.estado, 400);
    assert.equal(respuesta.cuerpo.error, "BLOQUES_INVALIDOS");
});

test("CA-04: el administrador publica y oculta un concepto previo", async () => {
    const creado = await pedir("/admin/conceptos-previos", {
        metodo: "POST",
        cookie: admin,
        cuerpo: { titulo: "Publicable", slug: "publicable", orden: 1, contenido: [] },
    });
    const id = creado.cuerpo.concepto.id;

    const publicado = await pedir(`/admin/conceptos-previos/${id}/publicado`, {
        metodo: "PATCH",
        cookie: admin,
        cuerpo: { publicado: true },
    });
    assert.equal(publicado.estado, 200);
    assert.equal(publicado.cuerpo.concepto.publicado, true);

    const oculto = await pedir(`/admin/conceptos-previos/${id}/publicado`, {
        metodo: "PATCH",
        cookie: admin,
        cuerpo: { publicado: false },
    });
    assert.equal(oculto.estado, 200);
    assert.equal(oculto.cuerpo.concepto.publicado, false);
});

test("CA-04: el administrador edita y publica un concepto previo desde el editor", async () => {
    const creado = await pedir("/admin/conceptos-previos", {
        metodo: "POST",
        cookie: admin,
        cuerpo: { titulo: "Editable", slug: "editable", orden: 1, contenido: [] },
    });
    const id = creado.cuerpo.concepto.id;

    const actualizado = await pedir(`/admin/conceptos-previos/${id}`, {
        metodo: "PUT",
        cookie: admin,
        cuerpo: {
            titulo: "Editable publicado",
            slug: "editable",
            orden: 2,
            contenido: [{ id: "b1", tipo: "texto", texto: "Texto actualizado." }],
            publicado: true,
        },
    });
    assert.equal(actualizado.estado, 200);
    assert.equal(actualizado.cuerpo.concepto.publicado, true);
    assert.equal(actualizado.cuerpo.concepto.orden, 2);

    const creadoPublicado = await pedir("/admin/conceptos-previos", {
        metodo: "POST",
        cookie: admin,
        cuerpo: {
            titulo: "Nuevo publicado",
            slug: "nuevo-publicado",
            orden: 3,
            contenido: [],
            publicado: true,
        },
    });
    assert.equal(creadoPublicado.estado, 201);
    assert.equal(creadoPublicado.cuerpo.concepto.publicado, true);
});

test("CA-05: el listado público solo muestra conceptos publicados", async () => {
    await ConceptoPrevio.deleteMany({});
    await ConceptoPrevio.create({ titulo: "Público", slug: "publico", contenido: [], orden: 1, publicado: true });
    await ConceptoPrevio.create({ titulo: "Borrador", slug: "borrador", contenido: [], orden: 2, publicado: false });

    const respuesta = await pedir("/conceptos-previos");
    assert.equal(respuesta.estado, 200);
    assert.equal(respuesta.cuerpo.conceptos.length, 1);
    assert.equal(respuesta.cuerpo.conceptos[0].slug, "publico");
});

test("CA-06: el detalle público devuelve el contenido de un concepto publicado", async () => {
    await ConceptoPrevio.create({
        titulo: "Detalle",
        slug: "detalle",
        contenido: [{ id: "b1", tipo: "texto", texto: "Contenido visible." }],
        orden: 1,
        publicado: true,
    });

    const respuesta = await pedir("/conceptos-previos/detalle");
    assert.equal(respuesta.estado, 200);
    assert.equal(respuesta.cuerpo.concepto.titulo, "Detalle");
    assert.equal(respuesta.cuerpo.concepto.contenido[0].texto, "Contenido visible.");
});

test("CA-07: el detalle público de un slug no publicado o inexistente devuelve 404", async () => {
    await ConceptoPrevio.create({ titulo: "Oculto", slug: "oculto", contenido: [], orden: 1, publicado: false });

    const noPublicado = await pedir("/conceptos-previos/oculto");
    assert.equal(noPublicado.estado, 404);
    assert.equal(noPublicado.cuerpo.error, "CONCEPTO_NO_ENCONTRADO");

    const inexistente = await pedir("/conceptos-previos/inexistente");
    assert.equal(inexistente.estado, 404);
    assert.equal(inexistente.cuerpo.error, "CONCEPTO_NO_ENCONTRADO");
});

test("CA-08: el listado público vacío responde con conceptos vacíos", async () => {
    await ConceptoPrevio.deleteMany({});

    const respuesta = await pedir("/conceptos-previos");
    assert.equal(respuesta.estado, 200);
    assert.deepEqual(respuesta.cuerpo.conceptos, []);
});

test("CA-09: estudiante y docente no pueden acceder a las rutas de administración", async () => {
    const estudiante = await conSesion("estudiante");
    const docente = await conSesion("docente");

    const respuestaEstudiante = await pedir("/admin/conceptos-previos", { cookie: estudiante });
    assert.equal(respuestaEstudiante.estado, 403);
    assert.equal(respuestaEstudiante.cuerpo.error, "SIN_PERMISO");

    const respuestaDocente = await pedir("/admin/conceptos-previos", { cookie: docente });
    assert.equal(respuestaDocente.estado, 403);
    assert.equal(respuestaDocente.cuerpo.error, "SIN_PERMISO");

    const escrituraEstudiante = await pedir("/admin/conceptos-previos", {
        metodo: "POST",
        cookie: estudiante,
        cuerpo: { titulo: "Hackeo", slug: "hackeo", orden: 1, contenido: [] },
    });
    assert.equal(escrituraEstudiante.estado, 403);
});

test("CA-10: el administrador guarda un concepto previo con imagen subida", async () => {
    const respuesta = await pedir("/admin/conceptos-previos", {
        metodo: "POST",
        cookie: admin,
        cuerpo: {
            titulo: "Con imagen",
            slug: "con-imagen",
            orden: 1,
            contenido: [{
                id: "img1",
                tipo: "imagen",
                url: "/api/archivos/ejemplo.png",
                alt: "Ejemplo",
                pie: "Pie de imagen",
            }],
        },
    });

    assert.equal(respuesta.estado, 201);
    assert.equal(respuesta.cuerpo.concepto.contenido[0].tipo, "imagen");
    assert.equal(respuesta.cuerpo.concepto.contenido[0].url, "/api/archivos/ejemplo.png");
});
