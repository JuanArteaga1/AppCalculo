import mongoose from "mongoose";

const { Mixed } = mongoose.Schema.Types;

const SLUG_VALIDO = /^[a-z0-9-]+$/;

/**
 * Conceptos previos del curso: contenido de apoyo que el administrador edita
 * con los mismos bloques que los temas y que los visitantes pueden ver sin sesión.
 */
const conceptoPrevioSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: (valor) => SLUG_VALIDO.test(valor),
            message: "El slug solo puede contener letras minúsculas, números y guiones."
        }
    },
    contenido: { type: [Mixed], default: [] },
    publicado: { type: Boolean, default: false },
    orden: { type: Number, default: 0 },
}, {
    timestamps: true,
    minimize: false,
});

conceptoPrevioSchema.index({ publicado: 1, orden: 1 });

export default mongoose.model("conceptosPrevios", conceptoPrevioSchema);
