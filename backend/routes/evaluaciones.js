import express from "express";
import evaluacionController from "../controllers/evaluacionController.js";
import { requiereRol, sesionOpcional } from "../middlewares/sesion.js";

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

// Listar estudiantes que han respondido quices del docente.
docentes.get("/estudiantes", evaluacionController.listarEstudiantesDocente);
// Quitar de la lista del docente (solo la oculta) y volver a mostrar.
docentes.delete("/estudiantes/:estudianteId", evaluacionController.ocultarEstudiante);
docentes.post("/estudiantes/:estudianteId/mostrar", evaluacionController.mostrarEstudiante);

docentes.get("/:id", evaluacionController.detalle);
docentes.put("/:id", evaluacionController.actualizar);
docentes.post("/:id/publicar", evaluacionController.publicar);
docentes.delete("/:id", evaluacionController.eliminar);
docentes.get("/:id/notas", evaluacionController.notas);

// Rutas exclusivas para estudiantes.
// Esta ruta permite peticiones sin sesión para mostrar el login wall (spec-quiz-login-wall).
// El controlador valida el quiz antes de exigir sesión.
estudiantes.get("/:id", sesionOpcional, evaluacionController.verParaEstudiante);

estudiantes.use(requiereRol("estudiante"));

estudiantes.get("/", evaluacionController.listarEstudiante);
estudiantes.post("/:id/respuestas", evaluacionController.responder);
estudiantes.get("/:id/resultado", evaluacionController.resultadoEstudiante);

route.use("/docente", docentes);
route.use("/estudiante", estudiantes);
route.use("/administrador", administradores);

export default route;