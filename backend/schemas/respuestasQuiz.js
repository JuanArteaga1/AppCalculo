
import mongoose from "mongoose";

const respuestaSchema = new mongoose.Schema({
    preguntaId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    opcionSeleccionada: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "La opción seleccionada debe ser un número entero."
        }
    }
}, {
    _id: false
});

const respuestasQuizSchema = new mongoose.Schema({
    evaluacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "evaluaciones",
        required: true
    },

    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },

    respuestas: {
        type: [respuestaSchema],
        required: true
    },

    aciertos: {
        type: Number,
        required: true,
        min: 0
    },

    nota: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    fechaRespuesta: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

// Un estudiante solo puede responder una vez cada evaluación.
respuestasQuizSchema.index(
    { evaluacion: 1, estudiante: 1 },
    { unique: true }
);

export default mongoose.model("respuestasQuiz", respuestasQuizSchema);
