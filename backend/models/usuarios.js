//import dbClient from "../config/dbClient.js";
import { ObjectId } from "mongodb";
import Usuario from "../schemas/usuarios.js";
import mongoose from "mongoose";

class usuariosModelo {

    async create(usuario ){
       /* const colUsuarios = dbClient.db.collection('usuarios');
        return await colUsuarios.insertOne(usuario);*/
        return await Usuario.create(usuario);
    }

    async update (id, usuario){
        /*const colUsuarios = dbClient.db.collection('usuarios');
        return await colUsuarios.updateOne({_id: new ObjectId(id)}, {$set: usuario});*/
        return await Usuario.findOneAndUpdate({_id: new mongoose.Types.ObjectId(id)});
    }

    async delete (id){
        /*const colUsuarios = dbClient.db.collection('usuarios');
        return await colUsuarios.deleteOne({_id: new ObjectId(id)});*/
        return await Usuario.findOneAndDelete({_id: new mongoose.Types.ObjectId(id)});
    }

    async getAll (){
        /*const colUsuarios = dbClient.db.collection('usuarios');
        return await colUsuarios.find({}).toArray();*/
        return await Usuario.find();
    }

    async getOne(id){
        /*const colUsuarios = dbClient.db.collection('usuarios');
        return await colUsuarios.findOne({_id: new ObjectId(id)});*/
        return await Usuario.findById(id);
    }
}

export default new usuariosModelo();