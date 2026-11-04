import mongoose from "mongoose";

const { Mixed } = mongoose.Schema.Types;

/** Copia de un tema cada vez que se publica: es el historial que se puede restaurar. */
const versionSchema = new mongoose.Schema({
    tema: { type: mongoose.Schema.Types.ObjectId, ref: "temas", required: true },
    version: { type: Number, required: true },
    titulo: { type: String, required: true },
    descripcion: { type: String, default: "" },
    bloques: { type: [Mixed], default: [] },
    videos: { type: [Mixed], default: undefined },
    practicas: { type: [Mixed], default: undefined },
    publicadoPor: { type: String, default: "" },
}, {
    timestamps: true,
    minimize: false,
});

versionSchema.index({ tema: 1, version: -1 }, { unique: true });

export default mongoose.model("versiones_tema", versionSchema);
