import {db, firestore} from '../config/firebaseConfig.js';
import {
    editProject,
    retrieveProject,
    saveProject,
    retrieveProjectQuery, deleteProject
} from "../models/projectModel.js";
import {ISOToFirestore} from '../utils/dbUtils.js';
import {deleteStage} from "../models/stageModel.js";
import {saveNotification} from "../models/notificationModel.js";
import {retrieveUser, retrieveUserQuery} from "../models/userModel.js";
import {retrievePerson} from "../models/personModel.js";
import {isAdmin, isClient, isEmployee, isOnProject} from "../utils/permissions.js";

export const getProject = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser) && !isClient(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

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
        //console.log("\n\n"+"Nenhum projeto encontrado"+"\n\n");
        return res.status(200).send({});
    }

    let resultados = [];
    try
    {
        if(req.currentUser.userType === 'C')
        {
            for(let i=0; i<projects.length; i++)
            {
                let client ={}, employee={};

                client.userData = req.currentUser;
                client.personData = req.currentPerson;
                employee.userData = await retrieveUser(projects[i].employeeID.split("/")[1]);
                employee.personData = await retrievePerson(employee.userData.personID.split("/")[1]);

                resultados.push({project: projects[i], client: client, employee: employee})
            }
        }
        if(req.currentUser.userType === 'F')
        {
            for(let i=0; i<projects.length; i++)
            {
                let client ={}, employee={};

                client.userData = (await retrieveUserQuery({fieldName: "personID", condition: "==", fieldValue: projects[i].clientID}))[0];
                client.personData = await retrievePerson(projects[i].clientID.split("/")[1]);
                employee.userData = req.currentUser;
                employee.personData = req.currentPerson;

                resultados.push({project: projects[i], client: client, employee: employee})
            }
        }
        if(req.currentUser.userType === 'A')
        {
            for(let i=0; i<projects.length; i++)
            {
                let client ={}, employee={};

                client.userData = (await retrieveUserQuery({fieldName: "personID", condition: "==", fieldValue: projects[i].clientID}))[0];
                client.personData = await retrievePerson(projects[i].clientID.split("/")[1]);
                employee.userData = await retrieveUser(projects[i].employeeID.split("/")[1]);
                employee.personData = await retrievePerson(employee.userData.personID.split("/")[1]);

                resultados.push({project: projects[i], client: client, employee: employee})
            }
        }
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }


    return res.status(200).send(resultados);
}

export const getProjectById = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser) && !isClient(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }


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
        return res.status(200).send({});
    }

    if(!isAdmin(req.currentUser) && !isOnProject(req.currentUser, project))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }


    let client = {}, employee = {};
    try
    {
        if(req.currentUser.userType === 'C')
        {
            client.userData = req.currentUser;
            client.personData = req.currentPerson;
            employee.userData = await retrieveUser(project.employeeID.split("/")[1]);
            employee.personData = await retrievePerson(employee.userData.personID.split("/")[1]);
        }
        if(req.currentUser.userType === 'F')
        {
            client.userData = (await retrieveUserQuery({fieldName: "personID", condition: "==", fieldValue: project.clientID}))[0];
            client.personData = await retrievePerson(project.clientID.split("/")[1]);
            employee.userData = req.currentUser;
            employee.personData = req.currentPerson;
        }
        if(req.currentUser.userType === 'A')
        {
            client.userData = (await retrieveUserQuery({fieldName: "personID", condition: "==", fieldValue: project.clientID}))[0];
            client.personData = await retrievePerson(project.clientID.split("/")[1]);
            employee.userData = await retrieveUser(project.employeeID.split("/")[1]);
            employee.personData = await retrievePerson(employee.userData.personID.split("/")[1]);
        }
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }


    return res.status(200).send({project: project, client: client, employee: employee});
}


export const postProject = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }


    const project = req.body;

    project.status="Em andamento";
    if(project.expectedEndDate)
    {

        const inputDate = new Date(project.expectedEndDate);
        const now = new Date();


        if(inputDate.getTime() <= now.getTime())
        {
            project.status="Em atraso";
        }

    }


    if(!project.startDate)
        project.startDate = firestore.FieldValue.serverTimestamp();
    else
        project.startDate = ISOToFirestore(project.startDate);
    project.endDate=null;
    project.expectedEndDate=ISOToFirestore(project.expectedEndDate);
    project.employeeID="users/"+req.currentUser.id;

    if(!project.stages || !Array.isArray(project.stages))
    {
        console.log("\n\n"+"Nenhuma etapa existente"+"\n\n");
        return res.status(200).send({});
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


    if(clientUser && clientUser.active)
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

        await saveNotification(notification);
    }

    return res.status(201).send({message: "Projeto criado com sucesso"});
}


export const putProject = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

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

    if(!isOnProject(req.currentUser, Oldproject))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    const project = req.body;
    if(project.expectedEndDate)
    {

        const inputDate = new Date(project.expectedEndDate); // Parse ISO date string
        const now = new Date();

        if(project.status !== "Finalizado") {
            if (inputDate.getTime() <= now.getTime()) {
                project.status = "Em atraso";
            } else {
                project.status = "Em andamento";
            }
        }

    }
    if(project.startDate)
        project.startDate = ISOToFirestore(project.startDate);

    if(project.expectedEndDate)
        project.expectedEndDate=ISOToFirestore(project.expectedEndDate);

    if(project.stages) {
        let OldStages = Oldproject.stages;
        let stages = project.stages;
        let newStages = []

        let posicaoAtual = null;
        let idDaPosicao = null
        OldStages.sort((a, b) => a.order - b.order);
        stages.sort((a, b) => a.order - b.order);


        for (let i = 0; i < OldStages.length; i++) {
            if (OldStages[i].status === "Em andamento")
                idDaPosicao = OldStages[i].id;
            newStages[i] = {};
            newStages[i].id = OldStages[i].id;
            newStages[i].order = OldStages[i].order;
            newStages[i].status = OldStages[i].status;
            for (let j = 0; j < stages.length; j++) {
                if (stages[j].id === newStages[i].id) {
                    newStages[i] = stages[j];
                }
            }
        }
        newStages.sort((a, b) => a.order - b.order);


        for (let i = 0; i < newStages.length; i++) {
            if (newStages[i].id === idDaPosicao) {
                newStages[i].status = "Em andamento";
                posicaoAtual = newStages[i].order;
            }
        }

        for (let i = 0; i < stages.length; i++)
        {
            if (!stages[i].id)
            {
                newStages.push(stages[i]);
            }
        }

        for (let i = 0; i < newStages.length; i++) {
            if (newStages[i].order < posicaoAtual)
                newStages[i].status = "Finalizada";

            if (newStages[i].order > posicaoAtual)
                newStages[i].status = "Não iniciada";

            if (newStages[i].order === posicaoAtual)
                newStages[i].status = "Em andamento";
        }


        project.stages = newStages;
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
        clientUser = (await retrieveUserQuery(query))[0];
    }
    catch(error)
    {}

    if(clientUser && clientUser.active)
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

        await saveNotification(notification);
    }


    return res.status(200).send({message: "Projeto atualizado com sucesso"});
}


export const deleteProjectById = async (req, res) =>
{
    if(!isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

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
        clientUser = (await retrieveUserQuery(query))[0];
    }
    catch(error)
    {}

    if(clientUser && clientUser.active)
    {
        let notification =
            {
                createdAt: firestore.FieldValue.serverTimestamp(),
                message: "O projeto " + Oldproject.name+" foi removido",
                projectID: "projects/"+req.params.id,
                read: false,
                receiverID: "users/"+clientUser.id,
                senderID: "users/"+req.currentUser.id,
                stageID: null,
                subject: "Remoção de projeto"
            }

        await saveNotification(notification);
    }

    return res.status(200).send({message: "Projeto removido com sucesso"});
}


export const deleteStageById = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let Oldproject;

    try
    {
        Oldproject = await retrieveProject(req.params.projectID);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(!isOnProject(req.currentUser, Oldproject))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let removedStage
    for(let i=0; i<Oldproject.stages.length; i++)
    {
        if(req.params.stageID === Oldproject.stages[i].id)
            removedStage=Oldproject.stages[i];
    }


    let projectRef = db.collection("projects").doc(req.params.projectID)
    let batch = db.batch();
    try
    {
        deleteStage(projectRef, req.params.stageID, batch);
        await batch.commit();
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
        clientUser = (await retrieveUserQuery(query))[0];
    }
    catch(error)
    {}

    if(clientUser && clientUser.active)
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

        await saveNotification(notification);
    }

    return res.status(200).send({message: "Etapa removida com sucesso"});
}


export const advanceStage = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

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

    if(!isOnProject(req.currentUser, Oldproject))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let project = {stages: []};
    let nextStage;

    Oldproject.stages.sort((a, b) => a.order - b.order);
    if(Oldproject.status === "Finalizado")
    {
        return res.status(400).send({message: "Erro ao avançar etapa. Projeto já foi finalizado"})
    }
    for (let i = 0; i < Oldproject.stages.length; i++)
    {
        if (Oldproject.stages[i].status === "Em andamento")
        {
            project.stages.push({
                id: Oldproject.stages[i].id,
                status: "Finalizada",
                endDate: firestore.FieldValue.serverTimestamp()
            });
            if (i < Oldproject.stages.length - 1)
            {
                project.stages.push({
                    id: Oldproject.stages[i+1].id,
                    status: "Em andamento",
                    startDate: firestore.FieldValue.serverTimestamp()
                });
                nextStage=Oldproject.stages[i+1];
            }
            else
            {
                project.status = "Finalizado";
                project.endDate = firestore.FieldValue.serverTimestamp();
            }
            break;
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
        clientUser = (await retrieveUserQuery(query))[0];
    }
    catch(error)
    {}

    if(clientUser && clientUser.active)
    {
        let notification = {
            createdAt: firestore.FieldValue.serverTimestamp(),
            projectID: "projects/" + req.params.id,
            read: false,
            receiverID: "users/" + clientUser.id,
            senderID: "users/" + req.currentUser.id
        };
        if(project.status !== "Finalizado") {
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

        await saveNotification(notification);
    }

    if(project.status !== "Finalizado")
    {
        return res.status(200).send({message: "Etapa do projeto " + Oldproject.name + " avançada com sucesso"});
    }
    else
    {
        return res.status(200).send({message: "O projeto " + Oldproject.name + " foi finalizado com sucesso"});
    }
}


export const returnStage = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

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

    if(!isOnProject(req.currentUser, Oldproject))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let project = {stages: []};
    let previousStage;
    Oldproject.stages.sort((a, b) => a.order - b.order);
    if(Oldproject.stages[0].status === "Em andamento")
    {
        return res.status(400).send({message: "Erro ao regredir etapa. O projeto já se encontra na primeira etapa"})
    }
    if(Oldproject.status === "Finalizado")
    {
        project.status = "Em andamento";
        project.endDate = null;
        project.stages.push({id: Oldproject.stages[Oldproject.stages.length-1].id, status: "Em andamento", endDate: null});
        previousStage = Oldproject.stages[Oldproject.stages.length-1]
    }
    else {
        for (let i = 0; i < Oldproject.stages.length; i++)
        {
            if (Oldproject.stages[i].status === "Em andamento")
            {

                project.stages.push({id: Oldproject.stages[i].id, status: "Não iniciada", startDate: null});
                project.stages.push({id: Oldproject.stages[i - 1].id, status: "Em andamento", endDate: null});
                previousStage = Oldproject.stages[i - 1];

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
        clientUser = (await retrieveUserQuery(query))[0];
    }
    catch(error)
    {}

    if(clientUser && clientUser.active)
    {
        let notification = {}
        notification.createdAt = firestore.FieldValue.serverTimestamp();
        notification.projectID = "projects/" + req.params.id;
        notification.read = false;
        notification.receiverID = "users/" + clientUser.id;
        notification.senderID = "users/" + req.currentUser.id;
        if(Oldproject.status === "Finalizado")
        {

            notification.message = "O projeto finalizado " + Oldproject.name + " regrediu para 'Em andamento'";
            notification.stageID = null;
            notification.subject = "Regressão de 'Finalizado' para 'Em andamento'";
        }
        else
        {
            notification.message = "O projeto " + Oldproject.name + " regrediu para a etapa "+previousStage.name;
            notification.stageID = "stages/" + previousStage.id;
            notification.subject = "Regressão de etapa";
        }

        await saveNotification(notification);
    }

    return res.status(200).send({message: "Etapa do projeto "+Oldproject.name+" regredida com sucesso"});
}