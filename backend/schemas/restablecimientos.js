import mongoose from "mongoose";
import { randomBytes, createHash } from "crypto";

const restablecimientoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usuarios",
        required: true,
        index: true
    },

    // Hash del token: el token en claro solo se conoce al crearlo.
    tokenHash: {
        type: String,
        required: true,
        index: true
    },

    // "confirmar-correo" o "restablecer".
    tipo: {
        type: String,
        required: true,
        enum: ["confirmar-correo", "restablecer"]
    },

    // 1 hora para restablecer, 24 horas para confirmar correo.
    vence: {
        type: Date,
        required: true,
        index: true
    },

    usado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

restablecimientoSchema.index({ usuario: 1, tipo: 1, usado: 1, vence: -1 });

export function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

export function generarTokenRestablecimiento() {
    return randomBytes(32).toString("hex");
}

export default mongoose.model("restablecimientos", restablecimientoSchema);
