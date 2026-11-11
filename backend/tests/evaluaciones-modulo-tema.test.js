import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import Evaluacion from "../schemas/evaluaciones.js";
import Modulo from "../schemas/modulos.js";
import Tema from "../schemas/temas.js";
import { arrancarBackend, buscarUsuario, conectarBase, crearUsuario, ingresar, limpiarYDesconectar } from "./apoyo.js";

// spec-creacion-de-temaas-y-modulos-parte-docente-admin. Usa los módulos y
// temas reales, sin crear ninguno: crear módulos de prueba ensucia el selector.
let backend;
let docente;
let otroDocente;
let limites;
let derivadas;
const docentes = [];

async function pedir(ruta, { metodo = "GET", cuerpo, cookie } = {}) {
    const respuesta = await fetch(`${backend.base}${ruta}`, {
        method: metodo,
        headers: {
            ...(cuerpo ? { "Content-Type": "application/json" } : {}),
            ...(cookie ? { Cookie: cookie } : {}),
        },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    return { estado: respuesta.status, cuerpo: await respuesta.json().catch(() => null) };
}

async function docenteConSesion() {
    const { correo, clave } = await crearUsuario({ rol: "docente" });
    docentes.push((await buscarUsuario(correo))._id);
    return (await ingresar(backend.base, correo, clave)).cookie;
}

const crearQuiz = (cookie, datos) => pedir("/evaluaciones/docente", {
    metodo: "POST",
    cookie,
    cuerpo: { titulo: "Quiz de test", preguntas: [], ...datos },
});

before(async () => {
    await conectarBase();
    backend = await arrancarBackend(5196);
    docente = await docenteConSesion();
    otroDocente = await docenteConSesion();

    const temas = await Tema.find({ modulo: { $in: ["limites", "derivadas"] } }).select("modulo numero").sort({ orden: 1 }).lean();
    limites = temas.filter((t) => t.modulo === "limites").map((t) => t.numero);
    derivadas = temas.filter((t) => t.modulo === "derivadas").map((t) => t.numero);
});

after(async () => {
    await Evaluacion.deleteMany({ docente: { $in: docentes } });
    backend?.detener();
    await limpiarYDesconectar();
});

test("CA-01 y CA-07: el listado trae solo los tres módulos del curso", async () => {
    const { estado, cuerpo } = await pedir("/temas");
    assert.equal(estado, 200);
    assert.deepEqual(cuerpo.modulos.map((m) => m.id), ["limites", "derivadas", "aplicaciones"]);
    assert.deepEqual(cuerpo.modulos.map((m) => m.titulo), ["Límites", "Derivadas", "Aplicación de la derivada"]);
});

test("CA-02, CA-04 y BR-05: cada módulo lista solo sus temas guardados, con su título", async () => {
    const { cuerpo } = await pedir("/temas");

    for (const modulo of cuerpo.modulos) {
        const enBase = await Tema.find({ modulo: modulo.id }).select("numero").lean();
        assert.deepEqual(modulo.temas.map((t) => t.id).sort(), enBase.map((t) => t.numero).sort());
        assert.ok(modulo.temas.every((t) => typeof t.titulo === "string" && t.titulo));
    }
});

test("CA-05 y CA-09: un quiz guarda su módulo y varios temas, y los devuelve", async () => {
    const creado = await crearQuiz(docente, { modulo: "limites", temas: limites.slice(0, 2) });
    assert.equal(creado.estado, 201);

    const guardado = await Evaluacion.findById(creado.cuerpo.evaluacion.id).lean();
    const modulo = await Modulo.findOne({ clave: "limites" }).lean();
    assert.equal(String(guardado.modulo), String(modulo._id));
    assert.equal(guardado.temas.length, 2);

    const detalle = await pedir(`/evaluaciones/docente/${creado.cuerpo.evaluacion.id}`, { cookie: docente });
    assert.deepEqual(detalle.cuerpo.evaluacion.temas.map((t) => t.numero), limites.slice(0, 2));

    const lista = await pedir("/evaluaciones/docente", { cookie: docente });
    const enLista = lista.cuerpo.evaluaciones.find((e) => e.id === creado.cuerpo.evaluacion.id);
    assert.deepEqual(enLista.temas.map((t) => t.numero), limites.slice(0, 2));
});

test("CA-08 y CA-11: sin temas no se guarda", async () => {
    for (const temas of [undefined, [], [""]]) {
        const respuesta = await crearQuiz(docente, { modulo: "limites", temas });
        assert.equal(respuesta.estado, 400);
        assert.equal(respuesta.cuerpo.error, "TEMAS_REQUERIDOS");
    }
});

test("CA-10: módulo inexistente, tema inexistente o de otro módulo responden 400 sin guardar", async () => {
    const antes = await Evaluacion.countDocuments({ docente: { $in: docentes } });

    const sinModulo = await crearQuiz(docente, { modulo: "no-existe", temas: [limites[0]] });
    assert.equal(sinModulo.estado, 400);
    assert.equal(sinModulo.cuerpo.error, "MODULO_NO_ENCONTRADO");

    const temaFalso = await crearQuiz(docente, { modulo: "limites", temas: ["9.99"] });
    assert.equal(temaFalso.estado, 400);
    assert.equal(temaFalso.cuerpo.error, "TEMA_INVALIDO");

    const mezclados = await crearQuiz(docente, { modulo: "limites", temas: [limites[0], derivadas[0]] });
    assert.equal(mezclados.estado, 400);
    assert.equal(mezclados.cuerpo.error, "TEMA_INVALIDO");

    assert.equal(await Evaluacion.countDocuments({ docente: { $in: docentes } }), antes);
});

test("CA-10: al editar, cambiar de módulo exige temas del módulo nuevo", async () => {
    const { cuerpo } = await crearQuiz(docente, { modulo: "limites", temas: [limites[0]] });
    const ruta = `/evaluaciones/docente/${cuerpo.evaluacion.id}`;

    const sinTemas = await pedir(ruta, { metodo: "PUT", cookie: docente, cuerpo: { modulo: "derivadas" } });
    assert.equal(sinTemas.estado, 400);
    assert.equal(sinTemas.cuerpo.error, "TEMAS_REQUERIDOS");

    const ajenos = await pedir(ruta, { metodo: "PUT", cookie: docente, cuerpo: { modulo: "derivadas", temas: [limites[0]] } });
    assert.equal(ajenos.estado, 400);

    const bien = await pedir(ruta, { metodo: "PUT", cookie: docente, cuerpo: { modulo: "derivadas", temas: [derivadas[0]] } });
    assert.equal(bien.estado, 200);
});

test("CA-10: editar o publicar el quiz de otro docente responde 403", async () => {
    const { cuerpo } = await crearQuiz(docente, { modulo: "limites", temas: [limites[0]] });
    const ruta = `/evaluaciones/docente/${cuerpo.evaluacion.id}`;

    const editar = await pedir(ruta, { metodo: "PUT", cookie: otroDocente, cuerpo: { titulo: "Cambiado" } });
    assert.equal(editar.estado, 403);
    assert.equal(editar.cuerpo.error, "QUIZ_AJENO");

    const publicar = await pedir(`${ruta}/publicar`, { metodo: "POST", cookie: otroDocente, cuerpo: {} });
    assert.equal(publicar.estado, 403);

    assert.equal((await Evaluacion.findById(cuerpo.evaluacion.id).lean()).titulo, "Quiz de test");
});

test("P9: un borrador viejo sin temas no se guarda ni se publica hasta elegirlos", async () => {
    const { cuerpo } = await crearQuiz(docente, { modulo: "limites", temas: [limites[0]] });
    await Evaluacion.updateOne({ _id: cuerpo.evaluacion.id }, { $set: { temas: [] } });
    const ruta = `/evaluaciones/docente/${cuerpo.evaluacion.id}`;

    const editar = await pedir(ruta, { metodo: "PUT", cookie: docente, cuerpo: { titulo: "Otro título" } });
    assert.equal(editar.cuerpo.error, "TEMAS_REQUERIDOS");

    const publicar = await pedir(`${ruta}/publicar`, { metodo: "POST", cookie: docente, cuerpo: {} });
    assert.equal(publicar.cuerpo.error, "TEMAS_REQUERIDOS");

    const conTemas = await pedir(ruta, { metodo: "PUT", cookie: docente, cuerpo: { temas: [limites[1]] } });
    assert.equal(conTemas.estado, 200);
});
