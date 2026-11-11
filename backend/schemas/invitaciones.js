import mongoose from "mongoose";
import { randomBytes, createHash } from "crypto";

const invitacionSchema = new mongoose.Schema({
    correo: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: /^[a-zA-Z0-9._%+-]+@uniautonoma\.edu\.co$/
    },

    rol: {
        type: String,
        required: true,
        enum: ["docente"]
    },

    // Hash del token: el token en claro solo se conoce al crear la invitación.
    tokenHash: {
        type: String,
        required: true,
        index: true
    },

    // La invitación vence a las 72 horas (BR-01).
    vence: {
        type: Date,
        required: true,
        index: true
    },

    usado: {
        type: Boolean,
        default: false
    },

    // Fecha del primer acceso al enlace (BR-01: 10 minutos tras abrir).
    abiertoEn: {
        type: Date,
        default: null
    },

    creadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    }
}, {
    timestamps: true
});

invitacionSchema.index({ correo: 1, usado: 1, vence: -1 });

export function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

export function generarTokenInvitacion() {
    return randomBytes(32).toString("hex");
}

export default mongoose.model("invitaciones", invitacionSchema);
