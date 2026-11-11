
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

    // Un registro nace al abrir el quiz (spec-estudiante RF-03): así aparece en
    // la lista del estudiante. Mientras no responda, nota y respuestas van vacías.
    abiertoEn: {
        type: Date,
        default: null
    },

    respuestas: {
        type: [respuestaSchema],
        default: []
    },

    aciertos: {
        type: Number,
        default: null,
        min: 0
    },

    // null = abierto sin responder. Con nota = respondido (una sola vez).
    nota: {
        type: Number,
        default: null,
        min: 1,
        max: 5
    },

    fechaRespuesta: {
        type: Date,
        default: null
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
