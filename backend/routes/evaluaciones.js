import express from "express";
import evaluacionController from "../controllers/evaluacionController.js";
import { requiereRol } from "../middlewares/sesion.js";

const route = express.Router();

const docentes = express.Router();
const estudiantes = express.Router();
const administradores = express.Router();

// Rutas exclusivas para docentes.
docentes.use(requiereRol("docente"));

// Rutas exclusivas para administradores.
administradores.use(requiereRol("administrador"));

administradores.get("/", evaluacionController.listarAdministrador);
administradores.get("/:id/notas", evaluacionController.notasAdministrador);
administradores.patch("/:id/habilitado", evaluacionController.cambiarHabilitado);

docentes.get("/", evaluacionController.listar);
docentes.post("/", evaluacionController.crear);

docentes.get("/:id", evaluacionController.detalle);
docentes.put("/:id", evaluacionController.actualizar);
docentes.post("/:id/publicar", evaluacionController.publicar);
docentes.delete("/:id", evaluacionController.eliminar);
docentes.get("/:id/notas", evaluacionController.notas);

// Rutas exclusivas para estudiantes.
estudiantes.use(requiereRol("estudiante"));

estudiantes.get("/", evaluacionController.listarEstudiante);
estudiantes.get("/:id", evaluacionController.verParaEstudiante);
estudiantes.post("/:id/respuestas", evaluacionController.responder);
estudiantes.get("/:id/resultado", evaluacionController.resultadoEstudiante);

route.use("/docente", docentes);
route.use("/estudiante", estudiantes);
route.use("/administrador", administradores);

export default route;