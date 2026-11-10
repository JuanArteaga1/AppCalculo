import mongoose from "mongoose";

const temaAbiertoSchema = new mongoose.Schema({
    modulo: { type: String, required: true, trim: true },
    tema: { type: String, required: true, trim: true },
    titulo: { type: String, default: "", trim: true },
    primeraVisita: { type: Date, default: Date.now },
    ultimaVisita: { type: Date, default: Date.now },
}, { _id: false });

const ejercicioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    funciones: { type: [mongoose.Schema.Types.Mixed], default: [] },
    herramienta: { type: String, default: "limite" },
    punto: { type: String, default: "0" },
    incremento: { type: String, default: "0.5" },
    vista: { type: mongoose.Schema.Types.Mixed, default: null },
    creado: { type: Date, default: Date.now },
});

const videoVistoSchema = new mongoose.Schema({
    videoId: { type: String, default: "", trim: true },
    youtubeId: { type: String, required: true, trim: true },
    titulo: { type: String, default: "", trim: true },
    unidad: { type: String, default: "", trim: true },
    vistoEn: { type: Date, default: Date.now },
}, { _id: false });

const mensajeSchema = new mongoose.Schema({
    from: { type: String, enum: ["user", "bot"], required: true },
    text: { type: String, default: "" },
    at: { type: Date, default: Date.now },
}, { _id: false });

const chatSchema = new mongoose.Schema({
    titulo: { type: String, default: "Conversación", trim: true },
    tema: { type: String, default: "limites", trim: true },
    mensajes: { type: [mensajeSchema], default: [] },
    actualizado: { type: Date, default: Date.now },
});

const notaSchema = new mongoose.Schema({
    evaluacionId: { type: String, required: true, trim: true },
    titulo: { type: String, default: "", trim: true },
    nota: { type: Number, min: 0, max: 5 },
}, { _id: false });

/**
 * Un documento por estudiante: temas abiertos, ejercicios del laboratorio,
 * videos vistos, chats con la IA y notas (vacío hasta el modelo de quices).
 */
const progresoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "usuarios", required: true, unique: true },
    temas: { type: [temaAbiertoSchema], default: [] },
    ejercicios: { type: [ejercicioSchema], default: [] },
    videos: { type: [videoVistoSchema], default: [] },
    chats: { type: [chatSchema], default: [] },
    notas: { type: [notaSchema], default: [] },
}, {
    timestamps: true,
});

export default mongoose.model("progresos", progresoSchema);
