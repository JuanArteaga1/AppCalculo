import mongoose from "mongoose";

const preguntaSchema = new mongoose.Schema({
    enunciado: {
        type: String,
        trim: true,
        default: ""
    },

    opciones: {
        type: [{
            type: String,
            trim: true
        }],
        default: []
    },

    respuestaCorrecta: {
        type: Number,
        min: 0,
        default: null
    }
}, {
    _id: true
});

const evaluacionSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },

    docente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },

    modulo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "modulos",
        required: true
    },

    // Uno o varios temas del módulo. Lo obligatorio lo exige el controlador:
    // los quices anteriores, con el campo viejo `tema`, quedan sin temas.
    temas: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "temas",
            required: true
        }],
        default: []
    },

    fechaLimite: {
        type: Date,
        default: null
    },

    preguntas: {
        type: [preguntaSchema],
        default: []
    },

    estado: {
        type: String,
        enum: ["borrador", "publicado"],
        default: "borrador",
        required: true
    },

    habilitado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model("evaluaciones", evaluacionSchema);
