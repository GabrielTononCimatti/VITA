import {
    deleteNotification, editNotification, retrieveNotification,
    retrieveNotificationQuery, saveNotification,

} from "../models/notificationModel.js";
import {isAdmin, isClient, isEmployee, isOnNotification} from "../utils/permissions.js";
import {firestore} from "../config/firebaseConfig.js";

export const getNotification = async (req, res) =>
{
    if(!isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let notifications
    try
    {
        notifications = await retrieveNotificationQuery(null);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(notifications.length === 0)
    {
        console.log("\n\n"+"Nenhuma notificação encontrada"+"\n\n");
        return res.status(400).send({message:"Nenhuma notificação encontrada".message});
    }

    return res.status(200).send(notifications);
}



export const getReceivedNotifications = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser) && !isClient(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }


    let query =
        {
            fieldName: "receiverID",
            condition: "==",
            fieldValue: "users/" + req.currentUser.id
        }

    let notifications
    try
    {
        notifications = await retrieveNotificationQuery(query);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(notifications.length === 0)
    {
        console.log("\n\n"+"Nenhuma notificação encontrada"+"\n\n");
        return res.status(400).send({message:"Nenhuma notificação encontrada".message});
    }

    return res.status(200).send(notifications);
}


export const getSendedNotifications = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser) && !isClient(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }


    let query =
        {
            fieldName: "senderID",
            condition: "==",
            fieldValue: "users/" + req.currentUser.id
        }

    let notifications
    try
    {
        notifications = await retrieveNotificationQuery(query);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(404).send({message:error.message});
    }

    if(notifications.length === 0)
    {
        console.log("\n\n"+"Nenhuma notificação encontrada"+"\n\n");
        return res.status(404).send({message:"Nenhuma notificação encontrada".message});
    }

    return res.status(200).send(notifications);
}


export const getNotificationById = async (req, res) =>
{

    let notification;

    try
    {
        notification = await retrieveNotification(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(!notification)
    {
        console.log("\n\n"+"Nenhuma notificação encontrada"+"\n\n");
        return res.status(404).send({message:"Nenhuma notificação encontrada".message});
    }

    if(!isOnNotification(req.currentUser, notification) && !isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }


    return res.status(200).send(notification);
}

export const postNotification = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser) && !isClient(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let notification = req.body;
    notification.createdAt = firestore.FieldValue.serverTimestamp();
    notification.read = false;
    notification.senderID ="users/"+req.currentUser.id;
    if(Array.isArray(notification.receiverID))
    {
        for(let i = 0; i < notification.receiverID.length; i++)
        {
            let newNotification = notification;
            newNotification.receiverID = notification.receiverID[i];
            await saveNotification(newNotification);
        }
    }
    else
    {
        await saveNotification(notification);
    }

    return res.status(200).send({message: "Notificação enviada com sucesso"});
}


export const deleteNotificationById = async (req, res) =>
{
    if(!isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    try
    {
        await deleteNotification(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    return res.status(200).send({message: "Notificação removida com sucesso"});
};


export const readNotification = async (req, res) =>
{
    let notification
    try
    {
        notification = await retrieveNotification(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(!notification)
    {
        console.log("\n\n"+"Nenhuma notificação encontrada"+"\n\n");
        return res.status(404).send({message:"Nenhuma notificação encontrada".message});
    }

    if(notification.receiverID !== "users/"+req.currentUser.id && !isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    try
    {
        await editNotification(req.params.id, {read: true});
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    return res.status(200).send({message: "Notificação lida com sucesso"});
}