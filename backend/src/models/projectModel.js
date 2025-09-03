import {db} from "../config/firebaseConfig.js";
import {docToObject, firestoreToISO, snapshotToArray, checkValidID, checkValidDate} from "../utils/dbUtils.js";
import {editStage, retrieveStageQuery, saveStage} from "./stageModel.js";


export const validateProject = (project, allFieldsRequired) =>
{
    if(!project)
        throw new Error("Dados não recebidos. Objeto 'project' vazio");
    
    if(allFieldsRequired)
    {
        if(project.clientID == null)
            throw new Error("'clientID' não pode ser null ou undefined");
        if(project.description == null)
            throw new Error("'description' não pode ser null ou undefined");
        if(project.employeeID == null)
            throw new Error("'employeeID' não pode ser null ou undefined");
        if(project.name == null)
            throw new Error("'name' não pode ser null ou undefined");
        if(project.startDate == null)
            throw new Error("'startDate' não pode ser null ou undefined");
        if(project.status == null)
            throw new Error("'status' não pode ser null ou undefined");
    }

    checkValidID("clientID", project.clientID, "persons");

    if(project.description && typeof project.description !== "string")
        throw new Error("'description' deve ser string");

    checkValidID("employeeID", project.employeeID, "users");

    checkValidDate("endDate", project.endDate);

    checkValidDate("expectedEndDate", project.expectedEndDate);

    if(project.name && typeof project.name !== "string")
        throw new Error("'name' deve ser string");

    checkValidDate("startDate", project.startDate);

    if(project.status && typeof project.status !== "string")
        throw new Error("'status' deve ser string");
    if (!['Em andamento', 'Em atraso', 'Finalizado', null, undefined].includes(project.status))
        throw new Error("Valor inválido para 'status'. Deve ser 'Em andamento', 'Em atraso' ou 'Finalizado'");
}


export const retrieveProject = async (id) =>
{
    if(!id)
        return null;

    let projectRef = db.collection('projects').doc(id);
    let project = docToObject(await projectRef.get());

    if(!project)
        return null;

    project.startDate = firestoreToISO(project.startDate);
    project.endDate = firestoreToISO(project.endDate);
    project.expectedEndDate = firestoreToISO(project.expectedEndDate);


    let stages = await retrieveStageQuery(projectRef, null);

    return {stages, ...project};
}


export const retrieveProjectQuery = async (query) =>
{
    let projects;
    if(query == null)
    {
        projects = snapshotToArray(await db.collection("projects").get())
    }
    else
    {
        projects = snapshotToArray(await db.collection("projects").where(query.fieldName, query.condition, query.fieldValue).get());
    }

    for(let i = 0; i < projects.length; i++)
    {
        let project = projects[i];
        let projectRef = db.collection('projects').doc(project.id);

        let stages = await retrieveStageQuery(projectRef, null)

        project.startDate = firestoreToISO(project.startDate);
        project.endDate = firestoreToISO(project.endDate);
        project.expectedEndDate = firestoreToISO(project.expectedEndDate);

        projects[i] = {stages, ...project};
    }
    return projects;
}

export const saveProject = async (project) =>
{
    if(!project)
        return null;
    let {stages, ...projectData} = project;
    if(!Array.isArray(stages))
        return null;
    validateProject(projectData, true);

    const batch = db.batch();
    let projectRef = db.collection('projects').doc();


    batch.set(projectRef, projectData);

    for(let i=0; i<stages.length; i++)
    {
        let id = await saveStage(projectRef, stages[i], batch);
        stages[i]={id: id, order: stages[i].order};
    }
    stages.sort((a, b) => a.order - b.order);

    await batch.commit();
    return { id: projectRef.id, stages};
}

export const editProject = async (id, project) =>
{
    if(!project || !id)
        return null;
    let {stages, ...projectData} = project;
    validateProject(projectData, false);

    const batch = db.batch();
    let projectRef = db.collection('projects').doc(id);

    if(projectData)
        batch.update(projectRef, projectData);

    if(!stages || !Array.isArray(stages))
    {
        await batch.commit();
        return {id: projectRef.id}
    }
    let newStages=[];
    for(let i=0; i<stages.length; i++)
    {
        let stage=stages[i];
        if(stage.id)
        {
            let stageID = stage.id;
            delete stage.id;
            await editStage(projectRef, stageID, stage, batch);
        }
        else
        {
            let stageID = saveStage(projectRef, stage, batch);
            newStages.push({id: stageID});
        }
    }


    return {id: projectRef.id, newStages};
}


export const deleteProject = async (id) =>
{
    if(!id)
        return null;

    await db.collection("projects").doc(id).delete();

    return id;
}