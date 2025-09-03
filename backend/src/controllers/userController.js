import {auth, firestore} from '../config/firebaseConfig.js';
import {editUser, retrieveUserQuery, deleteUser, retrieveUser} from "../models/userModel.js";

export const getUser = async (req, res) =>
{
    if(req.currentUser.userType !== 'A')
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let users;
    try
    {
        users = await retrieveUserQuery(null)
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(users.length === 0)
    {
        console.log("\n\n"+"Nenhum usuário encontrado"+"\n\n");
        return res.status(404).send({message:"Nenhum usuário encontrado"});
    }

    return res.status(200).send(users);
};


export const getUserById = async (req, res) =>
{
    if(req.currentUser.userType !== 'A' && req.currentUser.id !== req.params.id)
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let user
    try
    {
         user = await retrieveUser(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(!user)
    {
        console.log("\n\n"+"Nenhum usuário encontrado"+"\n\n");
        return res.status(404).send({message:"Nenhum usuário encontrado"});
    }

    return res.status(200).send(user);
}


export const register = async (req, res) =>
{
    const {email, password} = req.body;

    let preUser = await retrieveUser(req.params.id);

    if(!preUser)
    {
        console.log("\n\n"+"Nenhum usuário encontrado"+"\n\n");
        return res.status(404).send({message: "Nenhum usuário encontrado"});
    }

    if(preUser.active)
    {
        console.log("\n\n"+"Usuário já registrado"+"\n\n");
        return res.status(409).send({message: "Usuário já registrado"});
    }

    let userRecord;
    try
    {
        userRecord = await auth.createUser({email, password});
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    let user =
    {
        email:  email,
        firebaseUID: userRecord.uid,
        active: true,
        activated: firestore.FieldValue.serverTimestamp()
    }

    try
    {
        await editUser(req.params.id, user);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    return res.status(201).send({message: "Cadastro finalizado com sucesso"});
};


export const putUser = async (req, res) =>
{
    if(req.currentUser.userType !== 'A' && req.currentUser.id !== req.params.id)
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let user = req.body;

    try
    {
        await editUser(req.params.id, user);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    return res.status(200).send({message: "Dados do usuário editados com sucesso."});
};


export const deleteUserById = async (req, res) =>
{
    if(req.currentUser.userType !== 'A')
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    try
    {
        await deleteUser(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    return res.status(200).send({message: "Usuário deletado com sucesso"});
};