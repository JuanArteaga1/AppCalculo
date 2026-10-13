import express from "express";
import usuarioController from "../controllers/usuarioController.js";

const route = express.Router();

route.post('/', usuarioController.create);
route.get('/', usuarioController.getAll);
route.get('/:id', usuarioController.getOne);
route.put('/:id', usuarioController.update);
route.delete('/:id', usuarioController.delete);
route.post('/login', usuarioController.login);

export default route;