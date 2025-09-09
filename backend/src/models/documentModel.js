import {bucket, db} from "../config/firebaseConfig.js";
import {
    checkValidDate,
    checkValidID,
    checkValidStageID,
    docToObject,
    firestoreToISO,
    snapshotToArray
} from "../utils/dbUtils.js";

export const validateLink = (document, allFieldsRequired) =>
{
    if(!document)
        throw new Error("Dados não recebidos. Objeto 'document' vazio");

    const allowedFields = [
        "createdAt",
        "description",
        "name",
        "stageID",
        "url",
        "userID",
    ];


    const extraFields = Object.keys(document).filter(f => !allowedFields.includes(f));
    if (extraFields.length > 0) {
        throw new Error(`Campos não permitidos encontrados: ${extraFields.join(", ")}`);
    }

    if(allFieldsRequired)
    {
        if(document.createdAt == null)
            throw new Error("'createdAt' não pode ser null ou undefined");
        if(document.stageID == null)
            throw new Error("'stageID' não pode ser null ou undefined");
        if(document.url == null)
            throw new Error("'url' não pode ser null ou undefined");
        if(document.userID == null)
            throw new Error("'userID' não pode ser null ou undefined");
    }

    checkValidDate("createdAt", document.createdAt);

    if(document.description && typeof document.description !== "string")
        throw new Error("'description' deve ser string");

    if(document.name && typeof document.name !== "string")
        throw new Error("'name' deve ser string");

    checkValidStageID(document.stageID);

    if(document.url && typeof document.url !== "string")
        throw new Error("'url' deve ser string");

    checkValidID("userID", document.userID, "users");
}


export const validateDocument = (document, allFieldsRequired) =>
{
    if(!document)
        throw new Error("Dados não recebidos. Objeto 'document' vazio");

    const allowedFields = [
        "createdAt",
        "description",
        "fileSize",
        "name",
        "stageID",
        "url",
        "userID",
    ];


    const extraFields = Object.keys(document).filter(f => !allowedFields.includes(f));
    if (extraFields.length > 0) {
        throw new Error(`Campos não permitidos encontrados: ${extraFields.join(", ")}`);
    }

    if(allFieldsRequired)
    {
        if(document.createdAt == null)
            throw new Error("'createdAt' não pode ser null ou undefined");
        if(document.fileSize == null)
            throw new Error("'fileSize' não pode ser null ou undefined");
        if(document.name == null)
            throw new Error("'name' não pode ser null ou undefined");
        if(document.stageID == null)
            throw new Error("'stageID' não pode ser null ou undefined");
        if(document.url == null)
            throw new Error("'url' não pode ser null ou undefined")
        if(document.userID == null)
            throw new Error("'userID' não pode ser null ou undefined");
    }

    checkValidDate("createdAt", document.createdAt);

    if(document.description && typeof document.description !== "string")
        throw new Error("'description' deve ser string");

    if(document.fileSize && typeof document.fileSize !== "number")
        throw new Error("'fileSize' deve ser number");

    if(document.name && typeof document.name !== "string")
        throw new Error("'name' deve ser string");

    checkValidStageID(document.stageID);

    if(document.url && typeof document.url !== "string")
        throw new Error("'url' deve ser string");

    checkValidID("userID", document.userID, "users");
}


export const retrieveDocument = async (id) =>
{
    if(!id)
        return null;

    let doc = await db.collection('documents').doc(id).get();
    let document = docToObject(doc);
    document.createdAt = firestoreToISO(document.createdAt);

    return document;
}


export const retrieveDocumentQuery = async (query) =>
{
    let documents;
    if(query == null)
    {
        documents = snapshotToArray(await db.collection("documents").get())
    }
    else
    {
        documents = snapshotToArray(await db.collection("documents").where(query.fieldName, query.condition, query.fieldValue).get());
    }
    for(let i=0; i<documents.length; i++)
    {
        documents[i].createdAt = firestoreToISO(documents[i].createdAt);
    }
    return documents;
}


export const saveDocument = async (document) =>
{
    if(!document)
        return null;

    validateDocument(document, true);
    let documentRef = await db.collection('documents').add(document);

    return documentRef.id;
}


export const editDocument = async (id, document) =>
{
    if(!document || !id)
        return null;

    validateDocument(document, false);
    await db.collection('documents').doc(id).update(document);

    return id;
}


export const deleteDocument = async (id, url) =>
{
    if(!id)
        return null;

    if(url)
    {
        const filePath = url.match(/(?:app\/)(.*)$/)?.[1] || null
        await bucket.file(filePath).delete();
    }
    await db.collection("documents").doc(id).delete();

    return id;
}