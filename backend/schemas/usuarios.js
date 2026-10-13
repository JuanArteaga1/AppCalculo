import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    contrasena: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        required: true,
        enum: ['estudiante', 'docente', 'administrador']
    }
});

export default mongoose.model('usuarios', usuarioSchema);