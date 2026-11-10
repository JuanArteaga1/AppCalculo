import express from "express";
import progresoController from "../controllers/progresoController.js";
import { requiereRol } from "../middlewares/sesion.js";

const route = express.Router();
const estudiante = requiereRol("estudiante");

route.get("/", estudiante, progresoController.resumen);
route.post("/tema", estudiante, progresoController.registrarTema);
route.get("/ejercicios", estudiante, progresoController.listarEjercicios);
route.get("/ejercicios/:id", estudiante, progresoController.obtenerEjercicio);
route.post("/ejercicios", estudiante, progresoController.guardarEjercicio);
route.delete("/ejercicios/:id", estudiante, progresoController.borrarEjercicio);
route.get("/videos", estudiante, progresoController.listarVideos);
route.post("/videos", estudiante, progresoController.registrarVideo);
route.get("/chats", estudiante, progresoController.listarChats);
route.post("/chats", estudiante, progresoController.guardarChat);

export default route;
