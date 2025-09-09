
import {
    deletePerson,
    editPerson,
    retrievePerson,
    retrievePersonQuery,
    savePerson
} from "../models/personModel.js";
import {personToUserType} from '../utils/dbUtils.js';
import {auth, firestore} from "../config/firebaseConfig.js";
import {deleteUser, retrieveUserQuery, saveUser} from "../models/userModel.js";
import {isAdmin, isEmployee} from "../utils/permissions.js";

export const getPerson = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let persons;
    try
    {
        persons = await retrievePersonQuery(null);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(persons.length === 0)
    {
        console.log("\n\n"+"Nenhuma pessoa encontrada"+"\n\n");
        return res.status(404).send({message:"Nenhuma pessoa encontrada"});
    }


    return res.status(200).send(persons);
};

export const getPersonById = async (req, res) =>
{
    if(!isAdmin(req.currentUser) && !isEmployee(req.currentUser) && req.currentPerson.id !== req.params.id)
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let person;
    try
    {
        person = await retrievePerson(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(!person)
    {
        console.log("\n\n"+"Nenhuma pessoa encontrada"+"\n\n");
        return res.status(404).send({message:"Nenhuma pessoa encontrada"});
    }

    return res.status(200).send(person);
}


export const postPerson = async (req, res) =>
{
    if(!isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let person = req.body;
    let currentUser = req.currentUser;

    person.createdBy = "users/"+currentUser.id;

    person.createdAt = firestore.FieldValue.serverTimestamp();
    let personRefID;
    try
    {
        personRefID = await savePerson(person);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    let user =
        {
            personID: "persons/"+personRefID,
            userType: personToUserType(person.personType),
            active: false
        }

    let preUserID;
    try
    {
        preUserID = await saveUser(user);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    return res.status(201).send({ message: `Pessoa criada com sucesso, use POST localhost:5000/user/register/${preUserID}`, userID: preUserID});

};

export const putPerson = async (req, res) =>
{
    if(!isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }


    let person = req.body;
    try
    {
        await editPerson(req.params.id, person);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    return res.status(200).send({message: "Dados da pessoa editados com sucesso"});
};


export const deletePersonById = async (req, res) =>
{
    if(!isAdmin(req.currentUser))
    {
        console.log("\n\n"+"Erro 403: Forbidden. Acesso negado"+"\n\n");
        return res.status(403).send({message:"Erro 403: Forbidden. Acesso negado"});
    }

    let oldPerson, oldUser;
    try
    {
        oldPerson = await retrievePerson(req.params.id);
        oldUser = (await retrieveUserQuery({fieldName: "personID", condition: "==", fieldValue: "persons/"+oldPerson.id}))[0];
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }



    try
    {
        if (oldUser.firebaseUID)
        {
            await auth.deleteUser(oldUser.firebaseUID);
        }
        await deleteUser(oldUser.id);
        await deletePerson(req.params.id);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    return res.status(200).send({message: "Pessoa deletada com sucesso"});
};
