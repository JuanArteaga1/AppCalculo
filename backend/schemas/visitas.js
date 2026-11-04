import mongoose from "mongoose";

/** Un contador por tema y por día: no guarda nada de quien visita. */
const visitaSchema = new mongoose.Schema({
    fecha: { type: String, required: true },
    modulo: { type: String, required: true },
    tema: { type: String, required: true },
    total: { type: Number, default: 0 },
});

visitaSchema.index({ fecha: 1, modulo: 1, tema: 1 }, { unique: true });

export default mongoose.model("visitas", visitaSchema);
