import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import Evaluacion from "../schemas/evaluaciones.js";
import RespuestasQuiz from "../schemas/respuestasQuiz.js";
import { arrancarBackend, buscarUsuario, conectarBase, crearUsuario, ingresar, limpiarYDesconectar } from "./apoyo.js";

// Lista de estudiantes del docente: quitar de la lista y exportar las notas de un quiz.
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
    backend = await arrancarBackend(5186);
    docente = await conSesion("docente");
});

after(async () => {
    await RespuestasQuiz.deleteMany({ estudiante: { $in: ids } });
    await Evaluacion.deleteMany({ docente: { $in: ids } });
    backend?.detener();
    await limpiarYDesconectar();
});

test("Quitar estudiante: el docente lo oculta de su lista, lo vuelve a mostrar y no puede ocultar a quien no respondió", async () => {
    const id = await quizPublicado();
    const estudiante = await conSesion("estudiante");
    assert.equal((await enviar(id, estudiante, [0, 1])).estado, 201);

    const lista = async () => (await pedir("/evaluaciones/docente/estudiantes", { cookie: docente })).cuerpo;
    const estudianteId = (await lista()).estudiantes.find((e) => e.notas.some((n) => n.id === id)).id;

    assert.equal((await pedir(`/evaluaciones/docente/estudiantes/${estudianteId}`, { metodo: "DELETE", cookie: docente })).estado, 204);
    let datos = await lista();
    assert.ok(!datos.estudiantes.some((e) => e.id === estudianteId), "ya no aparece en la lista");
    assert.ok(datos.ocultos.some((e) => e.id === estudianteId), "queda entre los ocultos");
    assert.equal((await pedir(`/evaluaciones/docente/${id}/notas`, { cookie: docente })).estado, 200, "sus notas siguen guardadas");

    assert.equal((await pedir(`/evaluaciones/docente/estudiantes/${estudianteId}/mostrar`, { metodo: "POST", cookie: docente })).estado, 204);
    datos = await lista();
    assert.ok(datos.estudiantes.some((e) => e.id === estudianteId), "vuelve a la lista");

    const ajeno = (await buscarUsuario((await crearUsuario({ rol: "estudiante" })).correo))._id;
    ids.push(ajeno);
    assert.equal((await pedir(`/evaluaciones/docente/estudiantes/${ajeno}`, { metodo: "DELETE", cookie: docente })).estado, 404);
    assert.equal((await pedir(`/evaluaciones/docente/estudiantes/${estudianteId}`, { metodo: "DELETE", cookie: estudiante })).estado, 403);
});
