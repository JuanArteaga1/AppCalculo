import mongoose from "mongoose";

const funcionGuardadaSchema = new mongoose.Schema({
    id: { type: Number },
    entrada: { type: String, required: true, trim: true },
    color: { type: String, default: "#2563EB", trim: true },
    visible: { type: Boolean, default: true },
    nombre: { type: String, default: "f_{1}", trim: true },
}, { _id: false });

const ejercicioGuardadoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usuarios",
        required: true,
        index: true,
    },
    nombre: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    funciones: {
        type: [funcionGuardadaSchema],
        default: [],
    },
    herramienta: {
        type: String,
        default: "limite",
        trim: true,
        maxlength: 30,
    },
    punto: {
        type: String,
        default: "0",
        trim: true,
        maxlength: 30,
    },
    incremento: {
        type: String,
        default: "0.5",
        trim: true,
        maxlength: 30,
    },
    vista: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
}, {
    timestamps: true,
    collection: "ejercicios_guardados",
});

export default mongoose.model("ejercicios_guardados", ejercicioGuardadoSchema);
