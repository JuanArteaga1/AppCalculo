import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "crypto";
import Modulo from "../schemas/modulos.js";
import Tema from "../schemas/temas.js";
import VersionTema from "../schemas/versionesTema.js";
import Video from "../schemas/videos.js";
import { arrancarBackend, conectarBase, crearUsuario, ingresar, limpiarYDesconectar } from "./apoyo.js";

/**
 * Tarea 2: videoteca, laboratorio y conceptos previos.
 * La videoteca es una copia de lectura de los temas publicados: se reconstruye
 * al publicar y respeta la visibilidad y la papelera del tema de origen.
 */
const PUERTO = 5198;
const CLAVE_MODULO = `test.recursos.${randomBytes(4).toString("hex")}`;
const NUMERO_TEMA = `tr-${randomBytes(3).toString("hex")}`;
const NUMERO_CP = `tc-${randomBytes(3).toString("hex")}`;
const YOUTUBE_PUBLICADO = "aaaabbbbccc";
const YOUTUBE_IMPORTADO = "ddddeeeefff";

let backend;
let admin;
let docente;
let estudiante;
let moduloConceptosCreado = false;

async function pedir(ruta, { metodo = "GET", cookie, cuerpo } = {}) {
    const respuesta = await fetch(`${backend.base}${ruta}`, {
        method: metodo,
        headers: {
            ...(cookie ? { Cookie: cookie } : {}),
            ...(cuerpo === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(cuerpo === undefined ? {} : { body: JSON.stringify(cuerpo) }),
    });

    const cuerpoRespuesta = await respuesta.json().catch(() => null);
    return { estado: respuesta.status, cuerpo: cuerpoRespuesta };
}

const rutaTema = (modulo, numero) => `/admin/temas/${encodeURIComponent(modulo)}/${encodeURIComponent(numero)}`;

const videoPorYoutube = (lista, youtubeId) => lista.find((video) => video.youtubeId === youtubeId);

async function guardarBorrador(videos, practicas = []) {
    return pedir(rutaTema(CLAVE_MODULO, NUMERO_TEMA), {
        metodo: "PUT",
        cookie: admin,
        cuerpo: {
            titulo: "Tema de recursos",
            descripcion: "Creado por las pruebas de la Tarea 2",
            bloques: [],
            videos,
            practicas,
        },
    });
}

before(async () => {
    await conectarBase();

    const [cuentaAdmin, cuentaDocente, cuentaEstudiante] = await Promise.all([
        crearUsuario({ rol: "administrador" }),
        crearUsuario({ rol: "docente" }),
        crearUsuario({ rol: "estudiante" }),
    ]);

    await Modulo.create({
        clave: CLAVE_MODULO,
        titulo: "Módulo de recursos",
        descripcion: "",
        orden: 998,
    });

    if (!(await Modulo.exists({ clave: "conceptos-previos" }))) {
        await Modulo.create({
            clave: "conceptos-previos",
            titulo: "Conceptos previos",
            descripcion: "",
            orden: 999,
        });
        moduloConceptosCreado = true;
    }

    backend = await arrancarBackend(PUERTO);

    const [ingresoAdmin, ingresoDocente, ingresoEstudiante] = await Promise.all([
        ingresar(backend.base, cuentaAdmin.correo, cuentaAdmin.clave),
        ingresar(backend.base, cuentaDocente.correo, cuentaDocente.clave),
        ingresar(backend.base, cuentaEstudiante.correo, cuentaEstudiante.clave),
    ]);

    admin = ingresoAdmin.cookie;
    docente = ingresoDocente.cookie;
    estudiante = ingresoEstudiante.cookie;

    assert.ok(admin && docente && estudiante, "Las tres cuentas deben poder ingresar.");
});

after(async () => {
    if (backend) backend.detener();

    // Solo se borra lo creado por este archivo.
    const temas = await Tema.find({
        $or: [
            { modulo: CLAVE_MODULO },
            { modulo: "conceptos-previos", numero: NUMERO_CP },
        ],
    }).select("_id").lean();

    await VersionTema.deleteMany({ tema: { $in: temas.map((tema) => tema._id) } });
    await Tema.deleteMany({ _id: { $in: temas.map((tema) => tema._id) } });
    await Video.deleteMany({ modulo: { $in: [CLAVE_MODULO, "conceptos-previos"] } });
    await Modulo.deleteOne({ clave: CLAVE_MODULO });

    if (moduloConceptosCreado) {
        await Modulo.deleteOne({ clave: "conceptos-previos" });
    }

    await limpiarYDesconectar();
});

test("publicar reconstruye la videoteca con los videos del tema", async () => {
    const creado = await pedir("/admin/temas", {
        metodo: "POST",
        cookie: admin,
        cuerpo: {
            modulo: CLAVE_MODULO,
            numero: NUMERO_TEMA,
            titulo: "Tema de recursos",
            descripcion: "Creado por las pruebas de la Tarea 2",
            visibilidad: "publico",
        },
    });
    assert.equal(creado.estado, 201);

    const borrador = await guardarBorrador([
        { id: "v-publicado", url: YOUTUBE_PUBLICADO, titulo: "Video publicado", descripcion: "" },
    ]);
    assert.equal(borrador.estado, 200);

    const publicado = await pedir(`${rutaTema(CLAVE_MODULO, NUMERO_TEMA)}/publicar`, {
        metodo: "POST",
        cookie: admin,
    });
    assert.equal(publicado.estado, 200);

    const videos = await pedir("/videos", { cookie: estudiante });
    assert.equal(videos.estado, 200);
    assert.ok(videos.cuerpo.modulos.some((modulo) => modulo.id === CLAVE_MODULO));

    const video = videoPorYoutube(videos.cuerpo.videos, YOUTUBE_PUBLICADO);
    assert.ok(video, "El video publicado debe aparecer en la videoteca.");
    assert.equal(video.modulo, CLAVE_MODULO);
    assert.equal(video.numero, NUMERO_TEMA);
    assert.equal(video.temaTitulo, "Tema de recursos");
    assert.equal(video.titulo, "Video publicado");
});

test("un tema privado oculta sus videos a estudiante y docente, no al administrador", async () => {
    const cambio = await pedir(`${rutaTema(CLAVE_MODULO, NUMERO_TEMA)}/visibilidad`, {
        metodo: "PUT",
        cookie: admin,
        cuerpo: { visibilidad: "privado" },
    });
    assert.equal(cambio.estado, 200);

    for (const cookie of [undefined, estudiante, docente]) {
        const videos = await pedir("/videos", { cookie });
        assert.equal(videos.estado, 200);
        assert.equal(videoPorYoutube(videos.cuerpo.videos, YOUTUBE_PUBLICADO), undefined);
    }

    const tema = await pedir(`/temas/${CLAVE_MODULO}/${NUMERO_TEMA}`, { cookie: estudiante });
    assert.equal(tema.estado, 404);

    const comoAdmin = await pedir("/videos", { cookie: admin });
    assert.ok(videoPorYoutube(comoAdmin.cuerpo.videos, YOUTUBE_PUBLICADO));
});

test("la papelera oculta los videos y restaurar los devuelve", async () => {
    await pedir(`${rutaTema(CLAVE_MODULO, NUMERO_TEMA)}/visibilidad`, {
        metodo: "PUT",
        cookie: admin,
        cuerpo: { visibilidad: "publico" },
    });

    const eliminado = await pedir(rutaTema(CLAVE_MODULO, NUMERO_TEMA), {
        metodo: "DELETE",
        cookie: admin,
    });
    assert.equal(eliminado.estado, 200);

    const enPapelera = await pedir("/videos", { cookie: estudiante });
    assert.equal(videoPorYoutube(enPapelera.cuerpo.videos, YOUTUBE_PUBLICADO), undefined);

    const enPapeleraAdmin = await pedir("/videos", { cookie: admin });
    assert.equal(videoPorYoutube(enPapeleraAdmin.cuerpo.videos, YOUTUBE_PUBLICADO), undefined);

    const restaurado = await pedir(`${rutaTema(CLAVE_MODULO, NUMERO_TEMA)}/restaurar`, {
        metodo: "POST",
        cookie: admin,
    });
    assert.equal(restaurado.estado, 200);

    const visible = await pedir("/videos", { cookie: estudiante });
    assert.ok(videoPorYoutube(visible.cuerpo.videos, YOUTUBE_PUBLICADO));
});

test("importar agrega el video al borrador y solo aparece al publicar", async () => {
    const importado = await pedir("/admin/videos/importar", {
        metodo: "POST",
        cookie: admin,
        cuerpo: {
            modulo: CLAVE_MODULO,
            tema: NUMERO_TEMA,
            url: YOUTUBE_IMPORTADO,
            titulo: "Video importado",
            descripcion: "Venía del navegador",
        },
    });
    assert.equal(importado.estado, 201);
    assert.equal(importado.cuerpo.requierePublicar, true);

    const antes = await pedir("/videos", { cookie: estudiante });
    assert.equal(videoPorYoutube(antes.cuerpo.videos, YOUTUBE_IMPORTADO), undefined);

    const detalle = await pedir(rutaTema(CLAVE_MODULO, NUMERO_TEMA), { cookie: admin });
    assert.equal(detalle.estado, 200);
    assert.ok(videoPorYoutube(detalle.cuerpo.borrador.videos, YOUTUBE_IMPORTADO));

    const publicado = await pedir(`${rutaTema(CLAVE_MODULO, NUMERO_TEMA)}/publicar`, {
        metodo: "POST",
        cookie: admin,
    });
    assert.equal(publicado.estado, 200);

    const despues = await pedir("/videos", { cookie: estudiante });
    assert.ok(videoPorYoutube(despues.cuerpo.videos, YOUTUBE_IMPORTADO));
});

test("importar es solo para el administrador y rechaza duplicados", async () => {
    for (const cookie of [estudiante, docente]) {
        const respuesta = await pedir("/admin/videos/importar", {
            metodo: "POST",
            cookie,
            cuerpo: { modulo: CLAVE_MODULO, tema: NUMERO_TEMA, url: YOUTUBE_IMPORTADO, titulo: "No" },
        });
        assert.equal(respuesta.estado, 403);
    }

    const duplicado = await pedir("/admin/videos/importar", {
        metodo: "POST",
        cookie: admin,
        cuerpo: { modulo: CLAVE_MODULO, tema: NUMERO_TEMA, url: YOUTUBE_IMPORTADO, titulo: "Repetido" },
    });
    assert.equal(duplicado.estado, 409);
    assert.equal(duplicado.cuerpo.error, "VIDEO_DUPLICADO");
});

test("laboratorio muestra los ejercicios con la misma prioridad del editor", async () => {
    const videos = [
        { id: "v-publicado", url: YOUTUBE_PUBLICADO, titulo: "Video publicado", descripcion: "" },
        { id: "v-importado", url: YOUTUBE_IMPORTADO, titulo: "Video importado", descripcion: "" },
    ];

    const publicada = await guardarBorrador(
        videos,
        [{ id: "p-publicada", titulo: "Ejercicio publicado", funcion: "x^2", herramienta: "limite", punto: 2 }],
    );
    assert.equal(publicada.estado, 200);
    await pedir(`${rutaTema(CLAVE_MODULO, NUMERO_TEMA)}/publicar`, { metodo: "POST", cookie: admin });

    const borrador = await guardarBorrador(
        videos,
        [{ id: "p-borrador", titulo: "Ejercicio en borrador", funcion: "x+1", herramienta: "derivada", punto: 1 }],
    );
    assert.equal(borrador.estado, 200);

    const panel = await pedir("/admin/practicas", { cookie: admin });
    assert.equal(panel.estado, 200);

    const modulo = panel.cuerpo.modulos.find((item) => item.id === CLAVE_MODULO);
    assert.ok(modulo);
    const tema = modulo.temas.find((item) => item.id === NUMERO_TEMA);
    assert.ok(tema);
    assert.equal(tema.tieneBorrador, true);
    assert.equal(tema.practicas.length, 1);
    assert.equal(tema.practicas[0].titulo, "Ejercicio en borrador");

    const negado = await pedir("/admin/practicas", { cookie: estudiante });
    assert.equal(negado.estado, 403);

    await pedir(`${rutaTema(CLAVE_MODULO, NUMERO_TEMA)}/publicar`, { metodo: "POST", cookie: admin });
});

test("conceptos previos se publica aparte y nunca aparece en Cálculo I", async () => {
    const creado = await pedir("/admin/temas", {
        metodo: "POST",
        cookie: admin,
        cuerpo: {
            modulo: "conceptos-previos",
            numero: NUMERO_CP,
            titulo: "Repaso de prueba",
            descripcion: "Solo para las pruebas",
            visibilidad: "publico",
        },
    });
    assert.equal(creado.estado, 201);

    const borrador = await pedir(rutaTema("conceptos-previos", NUMERO_CP), {
        metodo: "PUT",
        cookie: admin,
        cuerpo: {
            titulo: "Repaso de prueba",
            descripcion: "Solo para las pruebas",
            bloques: [{ id: "cp-test", tipo: "texto", texto: "- Repaso de prueba" }],
            videos: [],
            practicas: [],
        },
    });
    assert.equal(borrador.estado, 200);

    await pedir(`${rutaTema("conceptos-previos", NUMERO_CP)}/publicar`, { metodo: "POST", cookie: admin });

    const previos = await pedir("/conceptos-previos", { cookie: estudiante });
    assert.equal(previos.estado, 200);
    const tema = previos.cuerpo.temas.find((item) => item.id === NUMERO_CP);
    assert.ok(tema);
    assert.equal(tema.bloques[0].texto, "- Repaso de prueba");

    const curso = await pedir("/temas", { cookie: estudiante });
    assert.equal(curso.estado, 200);
    assert.equal(
        curso.cuerpo.modulos.some((modulo) => modulo.id === "conceptos-previos"),
        false,
        "Conceptos previos no pertenece al curso de Cálculo I.",
    );

    await pedir(`${rutaTema("conceptos-previos", NUMERO_CP)}/visibilidad`, {
        metodo: "PUT",
        cookie: admin,
        cuerpo: { visibilidad: "privado" },
    });

    const privado = await pedir("/conceptos-previos", { cookie: estudiante });
    assert.equal(privado.cuerpo.temas.some((item) => item.id === NUMERO_CP), false);
});

test("el borrado definitivo elimina también sus videos derivados", async () => {
    const enPapelera = await pedir(rutaTema(CLAVE_MODULO, NUMERO_TEMA), {
        metodo: "DELETE",
        cookie: admin,
    });
    assert.equal(enPapelera.estado, 200);

    const definitivo = await pedir(`${rutaTema(CLAVE_MODULO, NUMERO_TEMA)}/definitivo`, {
        metodo: "DELETE",
        cookie: admin,
        cuerpo: { confirmar: true },
    });
    assert.equal(definitivo.estado, 200);

    assert.equal(await Video.countDocuments({ modulo: CLAVE_MODULO }), 0);

    const videos = await pedir("/videos", { cookie: admin });
    assert.equal(videoPorYoutube(videos.cuerpo.videos, YOUTUBE_PUBLICADO), undefined);
    assert.equal(videoPorYoutube(videos.cuerpo.videos, YOUTUBE_IMPORTADO), undefined);
});
