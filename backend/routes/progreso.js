import express from "express";
import progresoController from "../controllers/progresoController.js";
import { requiereRol } from "../middlewares/sesion.js";

const route = express.Router();
const estudiante = requiereRol("estudiante");
const docente = requiereRol("docente");

route.get("/", estudiante, progresoController.resumen);
route.get("/docente/estudiantes", docente, progresoController.progresoEstudiantesDocente);

route.post("/tema", estudiante, progresoController.registrarTema);
route.get("/ejercicios", estudiante, progresoController.listarEjercicios);
route.get("/ejercicios/:id", estudiante, progresoController.obtenerEjercicio);
route.post("/ejercicios", estudiante, progresoController.guardarEjercicio);
route.delete("/ejercicios/:id", estudiante, progresoController.borrarEjercicio);

route.get("/videos", requiereRol("estudiante", "docente"), progresoController.listarVideos);
route.post("/videos", requiereRol("estudiante", "docente"), progresoController.registrarVideo);

route.get("/chats", estudiante, progresoController.listarChats);
route.post("/chats", estudiante, progresoController.guardarChat);

export default route;
