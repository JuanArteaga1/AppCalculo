import usuariosModelo from "../models/usuarios.js"; 

class usuarioController {
    constructor() {
    }

    async create(req, res) {
        try {
            const data = await usuariosModelo.create(req.body);
            res.status(201).json(data);
        }catch (e) {
            res.status(500).send(e);
        }
    }

    async update (req, res) {
        try {
            const { id } = req.params;
            const data = await usuariosModelo.update(id, req.body);
            res.status(201).json(data);
        }catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    async delete (req, res) {
        try {
            const { id } = req.params;
            const data = await usuariosModelo.delete(id);
            res.status(206).json(data);
        }catch (e) {
            res.status(500).send(e);
        }
    }

    async getAll(req, res) {
        try {
            const data = await usuariosModelo.getAll();
            res.status(201).json(data);
        }catch (e) {
            res.status(500).send(e);
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params;
            const data = await usuariosModelo.getOne(id);
            res.status(201).json(data);
        }catch (e) {
            res.status(500).send(e);
        }
    }
}

export default new usuarioController();