import mongoose from "mongoose";

const { Mixed } = mongoose.Schema.Types;

/**
 * Un tema del curso. `bloques` es lo publicado, lo que ve el estudiante.
 * `borrador` guarda el trabajo del administrador hasta que lo publique.
 */
const temaSchema = new mongoose.Schema({
    modulo: { type: String, required: true, trim: true },
    numero: { type: String, required: true, trim: true },
    orden: { type: Number, required: true },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "", trim: true },
    bloques: { type: [Mixed], default: [] },
    // Sin valor por defecto: un tema sin el campo aún no pasó por la migración.
    videos: { type: [Mixed], default: undefined },
    practicas: { type: [Mixed], default: undefined },
    borrador: { type: Mixed, default: null },
    version: { type: Number, default: 1 },
    publicadoPor: { type: String, default: "" },
}, {
    timestamps: true,
    minimize: false,
});

temaSchema.index({ modulo: 1, numero: 1 }, { unique: true });

export default mongoose.model("temas", temaSchema);
