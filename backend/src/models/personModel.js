import {db} from "../config/firebaseConfig.js";
import {
    snapshotToArray,
    docToObject,
    checkValidPhoneNumber,
    checkValidID,
    checkValidDate,
    checkValidCPF,
    firestoreToISO, checkValidCNPJ,
} from "../utils/dbUtils.js";


export const validatePerson = (person, allFieldRequired) =>
{
    if(!person)
        throw new Error("Dados não recebidos. Objeto 'person' vazio");

    if(person.personType == null)
        throw new Error("'personType' não pode ser null ou undefined");

    if (!['A', 'F', 'PF', 'PJ', null, undefined].includes(person.personType))
        throw new Error("Valor inválido para 'personType'. Deve ser 'A', 'F', 'PF' ou 'PJ'");

    let allowedFields=[];
    switch(person.personType)
    {
        case 'A':
            allowedFields = [
                "createdAt",
                "createdBy",
                "name",
                "personType",
                "phoneNumber"
            ];
            break;

        case 'F':
            allowedFields = [
                "createdAt",
                "createdBy",
                "name",
                "personType",
                "phoneNumber"
            ];
            break;

        case 'PF':
            allowedFields = [
                "cpf",
                "createdAt",
                "createdBy",
                "name",
                "personType",
                "phoneNumber",
            ];
            break;

        case 'PJ':
            allowedFields = [
                "cnpj",
                "companyName",
                "createdAt",
                "createdBy",
                "personType",
                "phoneNumber",
                "tradeName"
            ];
            break;
    }

    const extraFields = Object.keys(person).filter(f => !allowedFields.includes(f));
    if (extraFields.length > 0) {
        throw new Error(`Campos não permitidos encontrados: ${extraFields.join(", ")}`);
    }

    if(allFieldRequired)
    {
        if(person.createdAt == null)
            throw new Error("'createdAt' não pode ser null ou undefined");
        if(person.createdBy == null)
            throw new Error("'createdBy' não pode ser null ou undefined");
        if(person.phoneNumber == null)
            throw new Error("'phoneNumber' não pode ser null ou undefined");

        switch(person.personType)
        {
            case 'A':
                if(person.name == null)
                    throw new Error("'name' não pode ser null ou undefined");
                break;
            case 'F':
                if(person.name == null)
                    throw new Error("'name' não pode ser null ou undefined");
                break;
            case 'PF':
                if(person.cpf == null)
                    throw new Error("'cpf' não pode ser null ou undefined");
                if(person.name == null)
                    throw new Error("'name' não pode ser null ou undefined");
                break;
            case 'PJ':
                if(person.cnpj == null)
                    throw new Error("'cnpj' não pode ser null ou undefined");
                if(person.tradeName == null)
                    throw new Error("'tradeName' não pode ser null ou undefined")
                break;
        }
    }

    checkValidDate("createdAt", person.createdAt);

    checkValidID("createdBy", person.createdBy, "users");

    checkValidPhoneNumber(person.phoneNumber);

    switch(person.personType)
    {
        case 'A':

            if(person.name && typeof person.name !== "string")
                throw new Error("'name' deve ser string");
            break;


        case 'F':
            if(person.name && typeof person.name !== "string")
                throw new Error("'name' deve ser string");
            break;


        case 'PF':

            checkValidCPF(person.cpf);

            if(person.name && typeof person.name !== "string")
                throw new Error("'name' deve ser string");
            break;


        case 'PJ':

            checkValidCNPJ(person.cnpj);

            if(person.companyName && typeof person.companyName !== "string")
                throw new Error("'companyName' deve ser string");

            if(person.tradeName && typeof person.tradeName !== "string")
                throw new Error("'tradeName' deve ser string");
            break;
    }
}


export const retrievePerson = async (id) =>
{
    if(!id)
        return null;

    let doc = await db.collection('persons').doc(id).get();
    let person = docToObject(doc);
    person.createdAt = firestoreToISO(person.createdAt);

    return person;
}


export const retrievePersonQuery = async (query) =>
{
    let persons;
    if(query == null)
    {
        persons = snapshotToArray(await db.collection("persons").get())
    }
    else
    {
        persons = snapshotToArray(await db.collection("persons").where(query.fieldName, query.condition, query.fieldValue).get());
    }
    for(let i=0; i<persons.length; i++)
    {
        persons[i].createdAt = firestoreToISO(persons[i].createdAt);
    }
    return persons;
}


export const savePerson = async (person) =>
{
    if(!person)
        return null;

    validatePerson(person, true);
    let personRef = await db.collection('persons').add(person);

    return personRef.id;
}


export const editPerson = async (id, person) =>
{
    if(!person || !id)
        return null;

    validatePerson(person, false);
    await db.collection('persons').doc(id).update(person);

    return id;
}


export const deletePerson = async (id) =>
{
    if(!id)
        return null;

    await db.collection("persons").doc(id).delete();

    return id;
}