import Tema from "../schemas/temas.js";
import Video from "../schemas/videos.js";

const ID_YOUTUBE = /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;

export function idYoutubeDeUrl(valor) {
    if (!valor || typeof valor !== "string") return null;

    const texto = valor.trim();
    if (/^[\w-]{11}$/.test(texto)) return texto;

    return texto.match(ID_YOUTUBE)?.[1] ?? null;
}

/**
 * Reemplaza los videos derivados de un tema. Se llama al publicar, así la
 * videoteca refleja exactamente lo que ve el estudiante en el tema.
 */
export async function sincronizarVideosTema(tema) {
    await Video.deleteMany({ temaId: tema._id });

    const videos = (tema.videos ?? []).flatMap((video, orden) => {
        const youtubeId = idYoutubeDeUrl(video?.url);

        if (!youtubeId) return [];

        return [{
            temaId: tema._id,
            modulo: tema.modulo,
            numero: tema.numero,
            videoId: String(video?.id ?? ""),
            titulo: String(video?.titulo ?? ""),
            descripcion: String(video?.descripcion ?? ""),
            youtubeId,
            url: `https://www.youtube.com/watch?v=${youtubeId}`,
            orden,
        }];
    });

    if (videos.length) {
        await Video.insertMany(videos);
    }

    return videos.length;
}

export async function eliminarVideosTema(temaId) {
    await Video.deleteMany({ temaId });
}

/**
 * Reconstruye la colección completa desde los temas. Incluye los que están en
 * la papelera: visibilidad y borrado se filtran al leer, y así restaurar un
 * tema no exige volver a sincronizar.
 */
export async function sincronizarTodosLosVideos() {
    const temas = await Tema.find().select("_id modulo numero videos").lean();
    let videos = 0;

    for (const tema of temas) {
        videos += await sincronizarVideosTema(tema);
    }

    const vigentes = temas.map((tema) => tema._id);
    const { deletedCount } = await Video.deleteMany({ temaId: { $nin: vigentes } });

    return { temas: temas.length, videos, huerfanos: deletedCount };
}
