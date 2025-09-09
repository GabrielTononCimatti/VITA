import {db} from "../config/firebaseConfig.js";
import {
    checkValidDate,
    checkValidID,
    docToObject,
    firestoreToISO,
    snapshotToArray
} from "../utils/dbUtils.js";


export const validateNotification = (notification, allFieldsRequired) =>
{
    if(!notification)
        throw new Error("Dados não recebidos. Objeto 'notification' vazio");

    const allowedFields = [
        "createdAt",
        "message",
        "projectID",
        "read",
        "receiverID",
        "senderID",
        "stageID",
        "subject"
    ];


    const extraFields = Object.keys(notification).filter(f => !allowedFields.includes(f));
    if (extraFields.length > 0) {
        throw new Error(`Campos não permitidos encontrados: ${extraFields.join(", ")}`);
    }

    if(allFieldsRequired)
    {
        if(notification.createdAt == null)
            throw new Error("'createdAt' não pode ser null ou undefined");
        if(notification.message == null)
            throw new Error("'message' não pode ser null ou undefined");
        if(notification.read == null)
            throw new Error("'read' não pode ser null ou undefined");
        if(notification.receiverID == null)
            throw new Error("'receiverID' não pode ser null ou undefined");
        if(notification.subject == null)
            throw new Error("'subject' não pode ser null ou undefined");
    }

    checkValidDate("createdAt", notification.createdAt);

    if(notification.message && typeof notification.message !== "string")
        throw new Error("'message' deve ser string");

    checkValidID("projectID", notification.projectID, "projects")

    if(notification.read && typeof notification.read !== "boolean")
        throw new Error("'read' deve ser boolean");

    checkValidID("receiverID", notification.receiverID, "users");

    checkValidID("stageID", notification.stageID, "stages")

    if(notification.subject && typeof notification.subject !== "string")
        throw new Error("'subject' deve ser string");

    checkValidID("senderID", notification.senderID, "users");
}


export const retrieveNotification = async (id) =>
{
    if(!id)
        return null;

    let doc = await db.collection('notifications').doc(id).get();
    let notification = docToObject(doc);
    notification.createdAt = firestoreToISO(notification.createdAt);

    return notification;
}


export const retrieveNotificationQuery = async (query) =>
{
    let notifications;
    if(query == null)
    {
        notifications = snapshotToArray(await db.collection("notifications").get())
    }
    else
    {
        notifications = snapshotToArray(await db.collection("notifications").where(query.fieldName, query.condition, query.fieldValue).get());
    }
    for(let i=0; i<notifications.length; i++)
    {
        notifications[i].createdAt = firestoreToISO(notifications[i].createdAt);
    }
    return notifications;
}


export const saveNotification = async (notification) =>
{
    if(!notification)
        return null;

    validateNotification(notification, true);
    let notificationRef = await db.collection('notifications').add(notification);

    return notificationRef.id;
}


export const editNotification = async (id, notification) =>
{
    if(!notification || !id)
        return null;

    validateNotification(notification, false);
    await db.collection('notifications').doc(id).update(notification);

    return id;
}


export const deleteNotification = async (id) =>
{
    if(!id)
        return null;

    await db.collection("notifications").doc(id).delete();

    return id;
}