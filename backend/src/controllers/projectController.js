import {firestore} from '../config/firebaseConfig.js';
import {
    editProject,
    retrieveProject,
    saveProject,
    retrieveProjectQuery, deleteProject
} from "../models/projectModel.js";
import {ISOToFirestore} from '../utils/dbUtils.js';
import {deleteStage} from "../models/stageModel.js";
import {saveNotification} from "../models/notificationModel.js";
import {retrieveUserQuery} from "../models/userModel.js";

export const getProject = async (req, res) =>
{
    if(!['A', 'C', 'F'].includes(req.currentUser.userType))
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let query;

    if(req.currentUser.userType === 'A')
        query = null;

    if(req.currentUser.userType === 'C')
    {
        query ={
            fieldName: "clientID",
            condition: "==",
            fieldValue: "persons/" + req.currentPerson.id
        }
    }

    if(req.currentUser.userType === 'F')
    {
        query ={
            fieldName: "employeeID",
            condition: "==",
            fieldValue: "users/" + req.currentUser.id
        }
    }

    let projects
    try
    {
        projects = await retrieveProjectQuery(query);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(projects.length === 0)
    {
        console.log("\n\n"+"Nenhum projeto encontrado"+"\n\n");
        return res.status(400).send({message:"Nenhum projeto encontrado".message});
    }

    return res.status(200).send(projects);
};

export const getProjectById = async (req, res) =>
{
    if(!['A', 'C', 'F'].includes(req.currentUser.userType))
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let project;

    try
    {
        project = await retrieveProject(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(!project)
    {
        console.log("\n\n"+"Nenhum projeto encontrado"+"\n\n");
        return res.status(400).send({message:"Nenhum projeto encontrado".message});
    }

    if(req.currentUser.userType === 'F' && project.employeeID !== "users/"+req.currentUser.id)
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    if(req.currentUser.userType === 'C' && project.clientID !== "persons/" + req.currentPerson.id)
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    return res.status(200).send(project);
}

export const postProject = async (req, res) =>
{
    if (!['A', 'F'].includes(req.currentUser.userType))
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    const project = req.body;

    project.startDate = firestore.FieldValue.serverTimestamp();
    project.endDate=null;
    project.expectedEndDate=ISOToFirestore(project.expectedEndDate);
    project.employeeID="users/"+req.currentUser.id;
    project.status="Em andamento";

    if(!project.stages || !Array.isArray(project.stages))
    {
        console.log("\n\n"+"Nenhuma etapa existente"+"\n\n");
        return res.status(400).send({message:"Nenhuma etapa existente".message});
    }

    let currentStage;
    for(let i=0; i<project.stages.length; i++)
    {
        project.stages[i].startDate=null;
        project.stages[i].status="Não iniciada";
        if(project.stages[i].order===1)
        {
            project.stages[i].startDate = firestore.FieldValue.serverTimestamp();
            project.stages[i].status="Em andamento";
            currentStage = project.stages[i];
        }
        project.stages[i].endDate=null;
    }

    let savedProject;
    try
    {
        savedProject = await saveProject(project);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    let clientUser;
    try
    {
        let query = {fieldName: "personID", condition: "==", fieldValue: project.clientID};
        clientUser = (await retrieveUserQuery(query))[0];
    }
    catch(error)
    {}


    if(clientUser.active)
    {
        let notification =
        {
            createdAt: firestore.FieldValue.serverTimestamp(),
            message: "Você foi adicionado ao projeto " + project.name,
            projectID: "projects/"+savedProject.id,
            read: false,
            receiverID: "users/"+clientUser.id,
            senderID: "users/"+req.currentUser.id,
            stageID: null,
            subject: "Criação de projeto"
        }

        saveNotification(notification);
    }

    return res.status(201).send({message: "Projeto criado com sucesso"});
};


export const putProject = async (req, res) =>
{
    if (!['A', 'F'].includes(req.currentUser.userType))
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let Oldproject;

    try
    {
        Oldproject = await retrieveProject(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(req.currentUser.userType === 'F' && Oldproject.employeeID !== "users/"+req.currentUser.id)
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    const project = req.body;
    if(project.expectedEndDate)
        project.expectedEndDate=ISOToFirestore(project.expectedEndDate);

    try
    {
        await editProject(req.params.id, project);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    let clientUser;
    try
    {
        let query = {fieldName: "personID", condition: "==", fieldValue: project.clientID}
        clientUser = await retrieveUserQuery(query)[0];
    }
    catch(error)
    {}

    if(clientUser.active)
    {
        let notification =
            {
                createdAt: firestore.FieldValue.serverTimestamp(),
                message: "O projeto " + project.name+" foi editado",
                projectID: "projects/"+req.params.id,
                read: false,
                receiverID: "users/"+clientUser.id,
                senderID: "users/"+req.currentUser.id,
                stageID: null,
                subject: "Edição de projeto"
            }

        saveNotification(notification);
    }


    return res.status(200).send({message: "Projeto atualizado com sucesso"});
};


export const deleteProjectById = async (req, res) =>
{
    if (!['A', 'F'].includes(req.currentUser.userType))
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let Oldproject;

    try
    {
        Oldproject = await retrieveProject(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(req.currentUser.userType === 'F' && Oldproject.employeeID !== "users/"+req.currentUser.id)
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    try
    {
        await deleteProject(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    let clientUser;
    try
    {
        let query = {fieldName: "personID", condition: "==", fieldValue: Oldproject.clientID}
        clientUser = await retrieveUserQuery(query)[0];
    }
    catch(error)
    {}

    if(clientUser.active)
    {
        let notification =
            {
                createdAt: firestore.FieldValue.serverTimestamp(),
                message: "O projeto " + Oldproject.name+" foi editado",
                projectID: "projects/"+req.params.id,
                read: false,
                receiverID: "users/"+clientUser.id,
                senderID: "users/"+req.currentUser.id,
                stageID: "stages/"+req.body.stageID,
                subject: "Remoção de projeto"
            }

        saveNotification(notification);
    }

    return res.status(200).send({message: "Projeto removido com sucesso"});
};


export const deleteStageById = async (req, res) =>
{
    if (!['A', 'F'].includes(req.currentUser.userType))
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let Oldproject;

    try
    {
        Oldproject = await retrieveProject(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(req.currentUser.userType === 'F' && Oldproject.employeeID !== "users/"+req.currentUser.id)
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let removedStage
    for(let i=0; i<Oldproject.stages.length; i++)
    {
        if(req.params.stageID === Oldproject.stages[i].id)
            removedStage=Oldproject.stages[i];
    }

    try
    {
        await deleteStage(req.params.projectID, req.params.stageID);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    let clientUser;
    try
    {
        let query = {fieldName: "personID", condition: "==", fieldValue: Oldproject.clientID}
        clientUser = await retrieveUserQuery(query)[0];
    }
    catch(error)
    {}

    if(clientUser.active)
    {
        let notification =
            {
                createdAt: firestore.FieldValue.serverTimestamp(),
                message: "A etapa "+removedStage.name+" do projeto " + Oldproject.name+" foi removida",
                projectID: "projects/"+req.params.projectID,
                read: false,
                receiverID: "users/"+clientUser.id,
                senderID: "users/"+req.currentUser.id,
                stageID: "stages/"+req.params.stageID,
                subject: "Remoção de etapa"
            }

        saveNotification(notification);
    }

    return res.status(200).send({message: "Etapa removida com sucesso"});
}


export const advanceStage = async (req, res) =>
{
    if (!['A', 'F'].includes(req.currentUser.userType))
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let Oldproject;

    try
    {
        Oldproject = await retrieveProject(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(req.currentUser.userType === 'F' && Oldproject.employeeID !== "users/"+req.currentUser.id)
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let project = {stages: []};
    let nextStage;
    for(let i=0; i<Oldproject.stages.length; i++)
    {
        if(i === Oldproject.stages.length-1)
        {
            project.stages.push({id: Oldproject.stages[i].id, status: "Finalizada", endDate: firestore.FieldValue.serverTimestamp()});
            project.status = "Finalizado";
            project.endDate = firestore.FieldValue.serverTimestamp();
        }
        else
        {
            if(Oldproject.stages[i].status === "Em andamento")
            {
                project.stages.push({id: Oldproject.stages[i].id, status: "Finalizada", endDate: firestore.FieldValue.serverTimestamp()});
                nextStage=Oldproject.stages[i+1];
                project.stages.push({id: Oldproject.stages[i+1].id, status: "Em andamento", startDate: firestore.FieldValue.serverTimestamp()});
                break;
            }
        }
    }

    try
    {
        await editProject(req.params.id, project);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }


    let clientUser;
    try
    {
        let query = {fieldName: "personID", condition: "==", fieldValue: Oldproject.clientID}
        clientUser = await retrieveUserQuery(query)[0];
    }
    catch(error)
    {}

    if(clientUser.active)
    {
        let notification = {
            createdAt: firestore.FieldValue.serverTimestamp(),
            projectID: "projects/" + req.params.id,
            read: false,
            receiverID: "users/" + clientUser.id,
            senderID: "users/" + req.currentUser.id,
        };
        if(!project.status === "Finalizado") {
            notification.message = "O projeto " + Oldproject.name + " avançou para a etapa "+nextStage.name;
            notification.stageID = "stages/" + nextStage.id;
            notification.subject = "Avanço de etapa";
        }
        else
        {
            notification.message = "O projeto " + Oldproject.name + " foi finalizado";
            notification.stageID = null;
            notification.subject = "Conclusão do projeto";
        }

        saveNotification(notification);
    }

    return res.status(200).send({message: "Etapa do projeto "+Oldproject.name+" avançada com sucesso"});
}


export const returnStage = async (req, res) =>
{
    if (!['A', 'F'].includes(req.currentUser.userType))
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let Oldproject;

    try
    {
        Oldproject = await retrieveProject(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(req.currentUser.userType === 'F' && Oldproject.employeeID !== "users/"+req.currentUser.id)
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});

    let project = {stages: []};
    let previousStage;
    for(let i=0; i<Oldproject.stages.length; i++)
    {
        if(i === 0)
        {
            return res.status(400).send({message: "Projeto já se encontra na primeira etapa"});
        }
        else
        {
            if(Oldproject.stages[i].status === "Em andamento")
            {
                project.stages.push({id: Oldproject.stages[i].id, status: "Não iniciada", startDate: null});
                project.stages.push({id: Oldproject.stages[i-1].id, status: "Em andamento", endDate: null});
                previousStage=Oldproject.stages[i-1];
                break;
            }
        }
    }

    try
    {
        await editProject(req.params.id, project);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }


    let clientUser;
    try
    {
        let query = {fieldName: "personID", condition: "==", fieldValue: Oldproject.clientID}
        clientUser = await retrieveUserQuery(query)[0];
    }
    catch(error)
    {}

    if(clientUser.active)
    {
        let notification = {
            createdAt: firestore.FieldValue.serverTimestamp(),
            message: "O projeto " + Oldproject.name + " regrediu para a etapa "+previousStage.name,
            projectID: "projects/" + req.params.id,
            read: false,
            receiverID: "users/" + clientUser.id,
            senderID: "users/" + req.currentUser.id,
            stageID: "stages/" + previousStage.id,
            subject: "Regressão de etapa",
        };

        saveNotification(notification);
    }

    return res.status(200).send({message: "Etapa do projeto "+Oldproject.name+" regredida com sucesso"});
}