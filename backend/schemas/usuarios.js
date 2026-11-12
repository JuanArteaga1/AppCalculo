import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({

    nombre: {
        type: String,
        trim: true,
        required: function () {
            return this.estado === "activo";
        }
    },

    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[a-zA-Z0-9._%+-]+@uniautonoma\.edu\.co$/
    },

    contrasena: {
        type: String,
        select: false
    },

    // Identificador de Google: une la cuenta aunque el correo cambie de formato.
    googleId: {
        type: String,
        trim: true,
        default: null
    },

    rol: {
        type: String,
        required: true,
        enum: ["estudiante", "docente", "administrador"]
    },

    estado: {
        type: String,
        required: true,
        enum: ["pendiente", "activo", "inactivo"],
        default: "pendiente"
    },

    // Solo estudiantes: un programa de lib/carreras.js (spec-login BR-11).
    carrera: { type: String, trim: true, default: null },

    // Cuándo aceptó la política de tratamiento de datos (Ley 1581).
    aceptoPoliticaEn: { type: Date, default: null },

    // Frecuencia de uso, para las estadísticas del panel.
    ingresos: { type: Number, default: 0 },
    ultimoIngreso: { type: Date, default: null },

    // Bloqueo tras intentos fallidos seguidos.
    intentosFallidos: { type: Number, default: 0 },
    bloqueadoHasta: { type: Date, default: null },

    // Va dentro del JWT: subirla invalida todas las sesiones abiertas.
    versionSesion: { type: Number, default: 0 },

    modulosAsignados: {
        type: [{
            type: String,
            trim: true
        }],
        default: [],
        validate: {
            validator: function (modulos) {
                return this.rol === "docente" || modulos.length === 0;
            },
            message: "Solo los docentes pueden tener módulos asignados."
        }
    }

}, {
    timestamps: true
});

export default mongoose.model("usuarios", usuarioSchema);