import {
    checkValidDate,
    checkValidID,
    docToObject,
    firestoreToISO,
    snapshotToArray
} from "../utils/dbUtils.js";



export const validateStage = (stage, allFieldsRequired) =>
{

    const allowedFields = [
        "description",
        "endDate",
        "name",
        "order",
        "requiresDocument",
        "startDate",
        "status"
    ];


    const extraFields = Object.keys(stage).filter(f => !allowedFields.includes(f));
    if (extraFields.length > 0) {
        throw new Error(`Campos não permitidos encontrados: ${extraFields.join(", ")}`);
    }

    if(allFieldsRequired)
    {
        if(stage.description == null)
            throw new Error("'description' não pode ser null ou undefined");
        if(stage.name == null)
            throw new Error("'name' não pode ser null ou undefined");
        if(stage.order == null)
            throw new Error("'order' não pode ser null ou undefined")
        if(stage.requiresDocument == null)
            throw new Error("'requiresDocument' não pode ser null ou undefined");
        if(stage.status == null)
            throw new Error("'status' não pode ser null ou undefined");
    }

    if(stage.description && typeof stage.description !== "string")
        throw new Error("'description' deve ser string");

    checkValidDate("endDate", stage.endDate);

    checkValidID("id", stage.id, "");

    if(stage.name && typeof stage.name !== "string")
        throw new Error("'name' deve ser string");

    if(stage.order && typeof stage.order !== "number")
        throw new Error("'order' deve ser number");

    if(stage.requiresDocument && typeof stage.requiresDocument !== "boolean")
        throw new Error("'requiresDocument' deve ser boolean");

    checkValidDate("startDate", stage.startDate);

    if(stage.status && typeof stage.status !== "string")
        throw new Error("'status' deve ser string");
    if (!['Não iniciada', 'Em andamento', 'Finalizada', null, undefined].includes(stage.status))
        throw new Error("Valor inválido para 'status'. Deve ser 'Não iniciada', 'Em andamento' ou 'Finalizada'");
}


export const retrieveStage = async (projectRef, id) =>
{
    if(!projectRef || !id)
        return null;

    let doc = await projectRef.collection('stages').doc(id).get();
    let stage = docToObject(doc);

    if(!stage)
        return null;

    stage.startDate=firestoreToISO(stage.startDate);
    stage.endDate=firestoreToISO(stage.endDate);

    return stage;
}


export const retrieveStageQuery = async (projectRef, query) =>
{
    if(!projectRef)
        return [];

    let stages;
    if(query == null)
    {
        stages = snapshotToArray(await projectRef.collection("stages").get())
    }
    else
    {
        stages = snapshotToArray(await projectRef.collection("stages").where(query.fieldName, query.condition, query.fieldValue).get());
    }

    stages.forEach(stage =>
    {
        stage.startDate = firestoreToISO(stage.startDate);
        stage.endDate = firestoreToISO(stage.endDate);
    });
    stages.sort((a, b) => a.order - b.order);

    return stages;
}


export const saveStage = (projectRef, stage, batch) =>
{
    if(!projectRef || !stage || !batch)
        return null;

    validateStage(stage, true);
    let stageRef = projectRef.collection('stages').doc();
    batch.set(stageRef, stage);

    return stageRef.id;
}


export const editStage = (projectRef, id, stage, batch) =>
{
    if(!projectRef || !id || !stage || !batch)
        return null;

    validateStage(stage, false);
    let stageRef = projectRef.collection('stages').doc(id);
    batch.update(stageRef, stage);

    return id;
}


export const deleteStage = (projectRef, id, batch) =>
{
    if(!projectRef || !id || !batch)
        return null;

    let stageRef = projectRef.collection('stages').doc(id);
    batch.delete(stageRef) ;

    return id;
}
