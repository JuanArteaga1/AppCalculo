import express from "express";
import temaController from "../controllers/temaController.js";

const route = express.Router();

route.get('/', temaController.curso);
route.get('/:modulo/:numero', temaController.publicado);

export default route;
