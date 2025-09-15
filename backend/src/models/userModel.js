import {auth, db} from "../config/firebaseConfig.js";
import {checkValidDate, checkValidID, docToObject, firestoreToISO, snapshotToArray} from "../utils/dbUtils.js";


export const validateUser = (user, allFieldsRequired) => {
    if (!user)
        throw new Error("Dados não recebidos. Objeto 'user' vazio");

    const allowedFields = [
        "activatedAt",
        "active",
        "email",
        "firebaseUID",
        "personID",
        "userType"
    ];


    const extraFields = Object.keys(user).filter(f => !allowedFields.includes(f));
    if (extraFields.length > 0) {
        throw new Error(`Campos não permitidos encontrados: ${extraFields.join(", ")}`);
    }

    if (allFieldsRequired)
    {
        if (user.active == null)
            throw new Error("'active' não pode ser null ou undefined");
        if (user.personID == null)
            throw new Error("'personID' não pode ser null ou undefined");
        if (user.userType == null)
            throw new Error("'userType' não pode ser null ou undefined");

        if (user.active)
        {
            if (user.activatedAt == null)
                throw new Error("'activatedAt' não pode ser null ou undefined");
            if (user.email == null)
                throw new Error("'email' não pode ser null ou undefined");
            if (user.firebaseUID == null)
                throw new Error("'firebaseUID' não pode ser null ou undefined");
        }
    }

    if (user.active && typeof user.active !== "boolean")
        throw new Error("'active' deve ser boolean");

    checkValidDate("activatedAt", user.activatedAt);

    if (user.email && typeof user.email !== "string")
        throw new Error("'email' deve ser string");

    if (user.firebaseUID && (typeof user.firebaseUID !== 'string' || user.firebaseUID.length !== 28))
        throw new Error("'firebaseUID' deve ser string de tamanho 28");

    checkValidID("personID", user.personID, "persons");

    if (!['A', 'C', 'F', null, undefined].includes(user.userType))
        throw new Error("Valor inválido para 'userType'. Deve ser 'A', 'C' ou 'F'");
}


export const retrieveUser = async (input) =>
{
    if(!input)
        return null;
    let user;
    if(input.length<500)
    {
        let doc = await db.collection('users').doc(input).get();
        user = docToObject(doc);
    }
    else
    {
        let firebaseUID = (await auth.verifyIdToken(input)).uid;
        let snapshot = await db.collection('users').where('firebaseUID', '==', firebaseUID).limit(1).get()
        user = snapshotToArray(snapshot)[0];
    }
    if(user && user.activatedAt)
        user.activatedAt = firestoreToISO(user.activatedAt);
    return user;
}


export const retrieveUserQuery = async (query) =>
{
    let users;
    if(query == null)
    {
        users = snapshotToArray(await db.collection("users").get())
    }
    else
    {
        users = snapshotToArray(await db.collection("users").where(query.fieldName, query.condition, query.fieldValue).get());
    }
    for(let i=0; i<users.length; i++)
    {
        if(users[i].activatedAt)
            users[i].activatedAt = firestoreToISO(users[i].activatedAt);
    }
    return users;
}


export const saveUser = async (user) =>
{
    if(!user)
        return null;

    validateUser(user, true);
    let userRef = await db.collection('users').add(user);

    return userRef.id;
}


export const editUser = async (id, user) =>
{
    if(!user || !id)
        return null;

    validateUser(user, false);
    await db.collection('users').doc(id).update(user);

    return id;
}


export const deleteUser = async (id) =>
{
    if(!id)
        return null;

    await db.collection("users").doc(id).delete();

    return id;
}

