import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import Evaluacion from "../schemas/evaluaciones.js";
import RespuestasQuiz from "../schemas/respuestasQuiz.js";
import { arrancarBackend, buscarUsuario, conectarBase, crearUsuario, ingresar, limpiarYDesconectar } from "./apoyo.js";

// spec-estudiante tarea D y spec-docente RF-05b: lista, responder, margen de
// 5 minutos, correctas al vencer y notas solo de quienes enviaron.
let backend;
let docente;
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

/** Quiz publicado de dos preguntas: la correcta de la 1 es la opción 0 y la de la 2, la 1. */
async function quizPublicado() {
    const creado = await pedir("/evaluaciones/docente", {
        metodo: "POST",
        cookie: docente,
        cuerpo: {
            titulo: "Quiz de test",
            modulo: "limites",
            temas: ["1.1"],
            preguntas: [
                { enunciado: "¿Uno?", opciones: ["Sí", "No"], respuestaCorrecta: 0 },
                { enunciado: "¿Dos?", opciones: ["A", "B", "C"], respuestaCorrecta: 1 },
            ],
        },
    });
    assert.equal(creado.estado, 201);
    const id = creado.cuerpo.evaluacion.id;
    const manana = new Date(Date.now() + 24 * 3600_000).toISOString();
    assert.equal((await pedir(`/evaluaciones/docente/${id}/publicar`, { metodo: "POST", cookie: docente, cuerpo: { fechaLimite: manana } })).estado, 200);
    return id;
}

const vencerHace = (id, ms) => Evaluacion.updateOne({ _id: id }, { $set: { fechaLimite: new Date(Date.now() - ms) } });

async function enviar(id, cookie, opciones) {
    const { cuerpo } = await pedir(`/evaluaciones/estudiante/${id}`, { cookie });
    const preguntas = cuerpo?.evaluacion?.preguntas ?? (await Evaluacion.findById(id).lean()).preguntas.map((p) => ({ id: p._id }));
    return pedir(`/evaluaciones/estudiante/${id}/respuestas`, {
        metodo: "POST",
        cookie,
        cuerpo: { respuestas: opciones.map((opcion, i) => ({ preguntaId: preguntas[i].id, opcionSeleccionada: opcion })) },
    });
}

before(async () => {
    await conectarBase();
    backend = await arrancarBackend(5194);
    docente = await conSesion("docente");
});

after(async () => {
    await RespuestasQuiz.deleteMany({ estudiante: { $in: ids } });
    await Evaluacion.deleteMany({ docente: { $in: ids } });
    backend?.detener();
    await limpiarYDesconectar();
});

test("CA-06, CA-04 y CA-09: el quiz aparece al abrirlo, exige todas las respuestas y se responde una sola vez", async () => {
    const id = await quizPublicado();
    const estudiante = await conSesion("estudiante");

    assert.deepEqual((await pedir("/evaluaciones/estudiante", { cookie: estudiante })).cuerpo.evaluaciones, []);

    const abierto = await pedir(`/evaluaciones/estudiante/${id}`, { cookie: estudiante });
    assert.equal(abierto.estado, 200);
    assert.ok(abierto.cuerpo.evaluacion.abiertoEn);
    assert.ok(!("respuestaCorrecta" in abierto.cuerpo.evaluacion.preguntas[0]));

    const lista = (await pedir("/evaluaciones/estudiante", { cookie: estudiante })).cuerpo.evaluaciones;
    assert.equal(lista.length, 1);
    assert.equal(lista[0].estado, "pendiente");

    const incompleto = await pedir(`/evaluaciones/estudiante/${id}/respuestas`, { metodo: "POST", cookie: estudiante, cuerpo: { respuestas: [] } });
    assert.equal(incompleto.estado, 400);

    const enviado = await enviar(id, estudiante, [0, 0]);
    assert.equal(enviado.estado, 201);
    assert.equal(enviado.cuerpo.resultado.aciertos, 1);
    assert.equal(enviado.cuerpo.resultado.nota, 3);

    assert.equal((await enviar(id, estudiante, [0, 1])).estado, 409);
    assert.equal((await pedir(`/evaluaciones/estudiante/${id}`, { cookie: estudiante })).estado, 409);

    const despues = (await pedir("/evaluaciones/estudiante", { cookie: estudiante })).cuerpo.evaluaciones[0];
    assert.equal(despues.estado, "respondido");
    assert.equal(despues.nota, 3);
});

test("CA-05: las correctas se ven solo cuando el quiz vence", async () => {
    const id = await quizPublicado();
    const estudiante = await conSesion("estudiante");
    await enviar(id, estudiante, [0, 2]);

    const antes = await pedir(`/evaluaciones/estudiante/${id}/resultado`, { cookie: estudiante });
    assert.equal(antes.estado, 200);
    assert.equal(antes.cuerpo.resultado.revision, undefined);

    await vencerHace(id, 60_000);
    const vencido = await pedir(`/evaluaciones/estudiante/${id}/resultado`, { cookie: estudiante });
    assert.equal(vencido.cuerpo.resultado.revision.length, 2);
    assert.equal(vencido.cuerpo.resultado.revision[1].respuestaCorrecta, 1);
    assert.equal(vencido.cuerpo.resultado.revision[1].correcta, false);
});

test("CA-11: vencido mientras responde, se acepta en los 5 minutos; después, no", async () => {
    const id = await quizPublicado();
    const aTiempo = await conSesion("estudiante");
    const tarde = await conSesion("estudiante");
    const sinAbrir = await conSesion("estudiante");

    await pedir(`/evaluaciones/estudiante/${id}`, { cookie: aTiempo });
    await pedir(`/evaluaciones/estudiante/${id}`, { cookie: tarde });

    // Lo abrieron hace 10 minutos y venció hace 2.
    await RespuestasQuiz.updateMany({ evaluacion: id }, { $set: { abiertoEn: new Date(Date.now() - 10 * 60_000) } });
    await vencerHace(id, 2 * 60_000);
    assert.equal((await enviar(id, aTiempo, [0, 1])).estado, 201);

    const nuncaAbrio = await pedir(`/evaluaciones/estudiante/${id}`, { cookie: sinAbrir });
    assert.equal(nuncaAbrio.estado, 403);
    assert.equal(nuncaAbrio.cuerpo.error, "QUIZ_VENCIDO");

    await vencerHace(id, 6 * 60_000);
    const fueraDeMargen = await enviar(id, tarde, [0, 1]);
    assert.equal(fueraDeMargen.estado, 403);
    assert.match(fueraDeMargen.cuerpo.descripcion, /5 minutos/);

    const lista = (await pedir("/evaluaciones/estudiante", { cookie: tarde })).cuerpo.evaluaciones;
    assert.equal(lista[0].estado, "vencido");
});

test("CA-02: un quiz deshabilitado no se responde y la lista lo marca como no disponible", async () => {
    const id = await quizPublicado();
    const estudiante = await conSesion("estudiante");
    await pedir(`/evaluaciones/estudiante/${id}`, { cookie: estudiante });
    await Evaluacion.updateOne({ _id: id }, { $set: { habilitado: false } });

    const abrir = await pedir(`/evaluaciones/estudiante/${id}`, { cookie: estudiante });
    assert.equal(abrir.estado, 403);
    assert.equal(abrir.cuerpo.error, "QUIZ_NO_DISPONIBLE");
    assert.equal((await pedir("/evaluaciones/estudiante", { cookie: estudiante })).cuerpo.evaluaciones[0].estado, "no-disponible");
});

test("RF-05b y CA-11 docente: el docente ve la estructura con la correcta, y las notas solo de quien envió", async () => {
    const id = await quizPublicado();
    const respondio = await conSesion("estudiante");
    const soloAbrio = await conSesion("estudiante");
    await enviar(id, respondio, [0, 1]);
    await pedir(`/evaluaciones/estudiante/${id}`, { cookie: soloAbrio });

    const detalle = await pedir(`/evaluaciones/docente/${id}`, { cookie: docente });
    assert.deepEqual(detalle.cuerpo.evaluacion.preguntas.map((p) => p.respuestaCorrecta), [0, 1]);

    const notas = await pedir(`/evaluaciones/docente/${id}/notas`, { cookie: docente });
    assert.equal(notas.cuerpo.cantidadRespuestas, 1);
    assert.equal(notas.cuerpo.promedio, 5);

    // Abrirlo no es responderlo: sin envíos, el quiz se puede borrar.
    const otro = await quizPublicado();
    await pedir(`/evaluaciones/estudiante/${otro}`, { cookie: soloAbrio });
    assert.equal((await pedir(`/evaluaciones/docente/${otro}`, { metodo: "DELETE", cookie: docente })).estado, 200);
    assert.equal(await RespuestasQuiz.countDocuments({ evaluacion: otro }), 0);
});
