import mongoose from "mongoose";

/**
 * Contador de preguntas al tutor por clave y día (spec-gestion-ia BR-03).
 * La clave es `ip:<hash>` o `usuario:<id>`: la IP nunca se guarda en claro.
 * No guarda preguntas ni respuestas (BR-08).
 */
const iaUsoSchema = new mongoose.Schema({
    clave: { type: String, required: true },
    // Día de Colombia, AAAA-MM-DD.
    dia: { type: String, required: true },
    cuenta: { type: Number, default: 0, min: 0 },
    // Mongo borra el documento solo, 3 días después.
    venceEn: { type: Date, required: true, expires: 0 },
}, {
    versionKey: false,
});

iaUsoSchema.index({ clave: 1, dia: 1 }, { unique: true });

export default mongoose.model("iauso", iaUsoSchema);
