import mongoose from "mongoose";

/**
 * Copia de lectura de los videos publicados de cada tema. La fuente de verdad
 * sigue siendo `temas.videos`; esta colección se reconstruye al publicar para
 * que la videoteca consulte sin recorrer el contenido de los temas.
 */
const videoSchema = new mongoose.Schema({
    temaId: { type: mongoose.Schema.Types.ObjectId, required: true },
    modulo: { type: String, required: true, trim: true },
    numero: { type: String, required: true, trim: true },
    // Identificador que le dio el editor del tema; se conserva para depurar.
    videoId: { type: String, default: "", trim: true },
    titulo: { type: String, default: "", trim: true },
    descripcion: { type: String, default: "", trim: true },
    youtubeId: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    orden: { type: Number, default: 0 },
}, {
    timestamps: true,
});

videoSchema.index({ temaId: 1, orden: 1 });
videoSchema.index({ modulo: 1, numero: 1 });

export default mongoose.model("videos", videoSchema);
