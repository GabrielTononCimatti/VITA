import {auth, firestore} from '../config/firebaseConfig.js';
import {editUser, retrieveUserQuery, retrieveUser} from "../models/userModel.js";
import {isAdmin, isEmployee} from "../utils/permissions.js";
import {saveNotification} from "../models/notificationModel.js";

export const getUser = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message: "Erro 403: Forbidden. Acesso negado"});
    }

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
}


export const getUserById = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser) && req.currentUser.id !== req.params.id)
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message: "Erro 403: Forbidden. Acesso negado"});
    }

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


export const login = async (req, res) =>
{
    return res.status(200).send({ message: 'Login bem-sucedido!', currentUser: req.currentUser, currentPerson: req.currentPerson});
}


export const register = async (req, res) =>
{
    const {email, firebaseUID} = req.body;

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


    let user =
        {
            email:  email,
            firebaseUID: firebaseUID,
            active: true,
            activatedAt: firestore.FieldValue.serverTimestamp()
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

    let notification =
        {
            createdAt: firestore.FieldValue.serverTimestamp(),
            message: "Registro concluído com sucesso.",
            projectID: null,
            read: false,
            receiverID: "users/"+req.params.id,
            senderID: null,
            stageID: null,
            subject: "Registro de usuário"
        }

    saveNotification(notification);


    return res.status(201).send({message: "Cadastro finalizado com sucesso"});
}



export const editEmailOrPassword = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && req.currentUser.id !== req.params.id)
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message: "Erro 403: Forbidden. Acesso negado"});
    }

    let email = req.body.email;
    let password = req.body.password;

    let oldUser, userRecord;
    try
    {
        oldUser = await retrieveUser(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    try
    {
        userRecord = await auth.updateUser(oldUser.firebaseUID, {email, password});
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

    let notification =
        {
            createdAt: firestore.FieldValue.serverTimestamp(),
            message: "Seus dados foram editados com sucesso.",
            projectID: null,
            read: false,
            receiverID: "users/"+req.params.id,
            senderID: null,
            stageID: null,
            subject: "Edição de dados"
        }

    saveNotification(notification);


    return res.status(200).send({message: "Dados do usuário editados com sucesso."});

}


export const putUser = async (req, res) =>
{
    if(!isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message: "Erro 403: Forbidden. Acesso negado"});
    }

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

    let senderID;


    senderID = "users/" + req.currentUser.id;

    let notification =
        {
            createdAt: firestore.FieldValue.serverTimestamp(),
            message: "Seus dados foram editados com sucesso.",
            projectID: null,
            read: false,
            receiverID: "users/"+req.params.id,
            senderID: senderID,
            stageID: null,
            subject: "Edição de dados"
        }

    saveNotification(notification);


    return res.status(200).send({message: "Dados do usuário editados com sucesso."});
}


export const deleteUserById = async (req, res) =>
{
    if(!isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message: "Erro 403: Forbidden. Acesso negado"});
    }

    let oldUser;
    try
    {
        oldUser = await retrieveUser(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    try
    {
        await auth.deleteUser(oldUser.firebaseUID);
        let user = {activatedAt: null, active: false, email: null, firebaseUID: null};
        await editUser(req.params.id, user);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    return res.status(200).send({message: "Usuário deletado com sucesso"});
}