import mongoose from "mongoose";

const moduloSchema = new mongoose.Schema({
    clave: { type: String, required: true, unique: true, trim: true },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    icono: { type: String, default: "" },
    color: { type: String, default: "" },
    orden: { type: Number, required: true },
});

export default mongoose.model("modulos", moduloSchema);
