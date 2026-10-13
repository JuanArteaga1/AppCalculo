
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

    rol: {
        type: String,
        required: true,
        enum: ["estudiante", "docente", "administrador"]
    },

    estado: {
        type: String,
        required: true,
        enum: ["pendiente", "activo"],
        default: "pendiente"
    }
}, {
    timestamps: true
});

export default mongoose.model("usuarios", usuarioSchema);
