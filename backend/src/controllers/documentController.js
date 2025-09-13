import {db, bucket, firestore} from '../config/firebaseConfig.js';
import {retrieveProject,} from "../models/projectModel.js";
import {retrieveUser, retrieveUserQuery} from "../models/userModel.js";
import {saveNotification} from "../models/notificationModel.js";
import {
    deleteDocument,
    retrieveDocument,
    retrieveDocumentQuery,
    validateDocument,
    validateLink
} from "../models/documentModel.js";
import {isAdmin, isClient, isEmployee, isOnProject} from "../utils/permissions.js";
import {retrievePerson} from "../models/personModel.js";

export const getAllDocuments = async (req, res) =>
{
    if(!isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let documents
    try
    {
        documents = await retrieveDocumentQuery(null);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(documents.length === 0)
    {
        console.log("\n\n"+"Nenhum documento encontrado"+"\n\n");
        return res.status(200).send({});
    }
    for(let i=0; i<documents.length; i++)
    {

        let user = await retrieveUser(documents[i].userID.split("/")[1]);

        let person = await retrievePerson(user.personID.split("/")[1]);
        let name;
        if(person.personType === "PJ")
            name = person.tradeName;
        else
            name = person.name;

        documents[i].createdBy = name;
    }


    return res.status(200).send(documents);
}


export const getDocumentByStage = async (req, res) =>
{

    let project
    try
    {
        project = await retrieveProject(req.params.projectID);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(!project)
    {
        console.log("\n\n"+"Nenhum projeto encontrado"+"\n\n");
        return res.status(400).send({message:"Nenhum projeto encontrado"});
    }


    if(!isAdmin(req.currentUser) && !isOnProject(req.currentUser, project))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let document
    let query ={
        fieldName: "stageID",
        condition: "==",
        fieldValue: "projects/" + req.params.projectID+"/stages/"+req.params.stageID
    }


    try
    {
        document = await retrieveDocumentQuery(query);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(document.length === 0)
    {
        console.log("\n\n"+"Nenhum documento encontrado"+"\n\n");
        return res.status(200).send({});
    }


    for(let i=0; i<document.length; i++)
    {

        let user = await retrieveUser(document[i].userID.split("/")[1]);

        let person = await retrievePerson(user.personID.split("/")[1]);
        let name;
        if(person.personType === "PJ")
            name = person.tradeName;
        else
            name = person.name;

        document[i].createdBy = name;
    }




    return res.status(200).send({document});
}


export const getDocumentById = async (req, res) =>
{
    let document;
    try
    {
        document = await retrieveDocument(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }


    if(!document)
    {
        console.log("\n\n"+"Nenhum documento encontrado"+"\n\n");
        return res.status().send({});
    }



    let project;

    try
    {
        project = await retrieveProject(document.stageID.split("/")[1]);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }


    if(!isAdmin(req.currentUser) && !isOnProject(req.currentUser, project))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }


    let user = await retrieveUser(document.userID.split("/")[1]);

    let person = await retrievePerson(user.personID.split("/")[1]);
    let name;
    if(person.personType === "PJ")
        name = person.tradeName;
    else
        name = person.name;

    document.createdBy = name;



    return res.status(200).send(document);
}

export const postDocument = async (req, res) =>
{

    let document = JSON.parse(req.body.data);
    let project;

    try
    {
        project = await retrieveProject(document.stageID.split("/")[1]);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    for(let i=0; i<project.stages.length; i++)
    {
        if(project.stages[i].id === document.stageID.split("/")[3])
        {
            if(!project.stages[i].requiresDocument)
            {
                console.log("\n\n"+"Erro 400: Etapa não permite o anexo de documentos"+"\n\n");
                return res.status(403).send({message:"Erro 400: Etapa não permite o anexo de documentos"});
            }
        }
    }

    try
    {
        if (!req.file) return res.status(400).send("Nenhum arquivo enviado.");

        const file = bucket.file(Date.now() + "-" + req.file.originalname);

        // Upload to Firebase Storage
        await file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype }
        });

        // Make file public (optional)
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

        // Save reference in Firestore


        if(!document.description)
            document.description = null;
        document.createdAt = firestore.FieldValue.serverTimestamp();
        document.fileSize = req.file.size;
        if(!document.name)
            document.name = req.file.originalname;
        document.url = publicUrl;
        document.userID = "users/"+req.currentUser.id;
        validateDocument(document, true);
        await db.collection("documents").add(document);




        if(req.currentUser.userType === 'F' || req.currentUser.userType === 'A')
        {
            let clientUser;
            try
            {
                let query = {fieldName: "personID", condition: "==", fieldValue: "persons/"+project.clientID};
                clientUser = (await retrieveUserQuery(query))[0];
            }
            catch (error)
            {}

            if (clientUser && clientUser.active)
            {
                let notification =
                    {
                        createdAt: firestore.FieldValue.serverTimestamp(),
                        message: "Um documento foi adicionado ao projeto " + project.name,
                        projectID: "projects/" + project.id,
                        read: false,
                        receiverID: "users/" + clientUser.id,
                        senderID: "users/" + req.currentUser.id,
                        stageID: "stages/" + document.stageID.split("/")[3],
                        subject: "Adição de documento"
                    }

                saveNotification(notification);
            }
        }
        if(req.currentUser.userType === 'C')
        {
            let notification =
                {
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    message: "Um documento foi adicionado ao projeto " + project.name,
                    projectID: "projects/" + project.id,
                    read: false,
                    receiverID: project.employeeID,
                    senderID: "users/" + req.currentUser.id,
                    stageID: "stages/" + document.stageID.split("/")[3],
                    subject: "Adição de documento"
                }

            saveNotification(notification);
        }


        return res.status(201).send({message: "Documento criado com sucesso"});
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }
}

export const postLink = async (req, res) =>
{

    let document = req.body;
    let project;

    try
    {
        project = await retrieveProject(document.stageID.split("/")[1]);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    for(let i=0; i<project.stages.length; i++)
    {
        if(project.stages[i].id === document.stageID.split("/")[3])
        {
            if(!project.stages[i].requiresDocument)
            {
                console.log("\n\n"+"Erro 400: Etapa não permite o anexo de documentos"+"\n\n");
                return res.status(403).send({message:"Erro 400: Etapa não permite o anexo de links"});
            }
        }
    }


    try
    {
        if(!document.description)
            document.description = null;
        if(!document.name)
            document.name = null;
        document.createdAt = firestore.FieldValue.serverTimestamp();
        document.userID = "users/"+req.currentUser.id;

        validateLink(document, true);
        await db.collection("documents").add(document);


        let project;
        try
        {
            project = await retrieveProject(document.stageID.split("/")[1]);
        }
        catch(error)
        {
            console.log("\n\n"+error+"\n\n");
            return res.status(400).send({message:error.message});
        }

        if(req.currentUser.userType === 'F' || req.currentUser.userType === 'A')
        {
            let clientUser;
            try
            {
                let query = {fieldName: "personID", condition: "==", fieldValue: "persons/"+project.clientID};
                clientUser = (await retrieveUserQuery(query))[0];
            }
            catch (error)
            {}

            if (clientUser && clientUser.active)
            {
                let notification =
                    {
                        createdAt: firestore.FieldValue.serverTimestamp(),
                        message: "Um documento foi adicionado ao projeto " + project.name,
                        projectID: "projects/" + project.id,
                        read: false,
                        receiverID: "users/" + clientUser.id,
                        senderID: "users/" + req.currentUser.id,
                        stageID: "stages/" + document.stageID.split("/")[3],
                        subject: "Adição de documento"
                    }

                saveNotification(notification);
            }
        }
        if(req.currentUser.userType === 'C')
        {
            let notification =
                {
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    message: "Um documento foi adicionado ao projeto " + project.name,
                    projectID: "projects/" + project.id,
                    read: false,
                    receiverID: project.employeeID,
                    senderID: "users/" + req.currentUser.id,
                    stageID: "stages/" + document.stageID.split("/")[3],
                    subject: "Adição de documento"
                }

            saveNotification(notification);
        }


        return res.status(201).send({message: "Documento criado com sucesso"});
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

}



export const deleteDocumentById = async (req, res) =>
{


    let document;

    try
    {
        document = await retrieveDocument(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(document.userID !== "users/"+req.currentUser.id && req.currentUser.userType !== "F" && req.currentUser.userType !== "A")
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    try
    {
        if(document.fileSize)
        {
            await deleteDocument(req.params.id, document.url);
        }
        else
        {
            await deleteDocument(req.params.id, null);
        }

    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    return res.status(200).send({message: "Documento removido com sucesso"});
}
