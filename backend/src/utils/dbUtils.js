import {firestore} from "../config/firebaseConfig.js";

export const docToObject = (doc) =>
{
    if(!doc.exists)
        return null;
    return {id: doc.id, ...doc.data()};
}

export const snapshotToArray = (snapshot) =>
{
    if(!snapshot || !snapshot.docs)
        return [];
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
}

export const personToUserType = (personType) =>
{
    let userType;

    if(personType==='PF' || personType==='PJ')
        userType='C';
    else
        userType=personType;

    return userType;
}

export const firestoreToISO = (firestoreTimestamp) =>
{
    if (!firestoreTimestamp)
        return null;

    if (firestoreTimestamp.toDate)
        return firestoreTimestamp.toDate().toISOString();

    return new Date(firestoreTimestamp._seconds * 1000).toISOString();
}

export const ISOToFirestore = (isoDate) =>
{
    if(!isoDate)
        return null;
    const date = isoDate instanceof Date ? isoDate : new Date(isoDate);
    return firestore.Timestamp.fromDate(date);
}

export const checkValidDate = (fieldName, fieldValue) =>
{
    if(!fieldValue)
        return;

    if(fieldValue instanceof firestore.Timestamp)
        return;

    if (fieldValue === firestore.FieldValue.serverTimestamp() || fieldValue._methodName === "serverTimestamp")
        return;

    if (typeof fieldValue === "string")
    {
        const date = new Date(fieldValue);
        if (!isNaN(date.getTime()))
            return;
    }
    throw new Error("Data inválida no campo '"+fieldName+"'");
}

export const checkValidID = (fieldName, fieldValue, collection) =>
{
    if(!fieldValue)
        return;

    if (typeof fieldValue !== "string")
        throw new Error("'"+fieldName+"' deve ser string");

    if(collection.length===0)
    {
        let regex = /^[A-Za-z0-9]{20}$/;
        if(!regex.test(fieldValue))
            throw new Error("'" + fieldName + "' deve seguir o formato <20-char-id>")
    }
    else
    {
        let regex = new RegExp(`^${collection}\\/([A-Za-z0-9]{20})$`);
        if (!regex.test(fieldValue))
            throw new Error("'" + fieldName + "' deve seguir o formato '" + collection + "/<20-char-id>'");
    }
}

export const checkValidStageID = (stageID) =>
{
    if(!stageID)
        return;

    if(typeof stageID !== "string")
        throw new Error("'stageID' deve ser string");

    let regex = /^projects\/[A-Za-z0-9]{20}\/stages\/[A-Za-z0-9]{20}$/;

    if(!regex.test(stageID))
        throw new Error("'stageID' deve seguir o formato 'projects/<20-char-id>/stages/<20-char-id>");

}

export const checkValidCPF = (cpf) =>
{
    if(!cpf)
        return;
    let Soma= 0
    let Resto
    let numbersRegex = /^[0-9]*$/;
    if(!numbersRegex.test(cpf))
        throw new Error("'cpf' deve conter apenas dígitos (0-9)");

    if(typeof cpf !== "string")
        throw new Error("'cpf' deve ser string");

    if (cpf.length !== 11)
        throw new Error("'cpf' deve ter 11 dígitos");

    if ([
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
    ].indexOf(cpf) !== -1)
        throw new Error("'cpf' inválido");

    for (let i=1; i<=9; i++)
        Soma = Soma + parseInt(cpf.substring(i-1, i)) * (11 - i);

    Resto = (Soma * 10) % 11

    if ((Resto === 10) || (Resto === 11))
        Resto = 0

    if (Resto !== parseInt(cpf.substring(9, 10)) )
        throw new Error("'cpf' inválido");

    Soma = 0

    for (let i = 1; i <= 10; i++)
        Soma = Soma + parseInt(cpf.substring(i-1, i)) * (12 - i)

    Resto = (Soma * 10) % 11

    if ((Resto === 10) || (Resto === 11))
        Resto = 0

    if (Resto !== parseInt(cpf.substring(10, 11) ) )
        throw new Error("'cpf' inválido");
}

export const checkValidCNPJ = (cnpj) =>
{
    if(!cnpj)
        return;

    let numbersRegex = /^[0-9]*$/;

    if(!numbersRegex.test(cnpj))
        throw new Error("'cnpj' deve conter apenas dígitos (0-9)");

    if(typeof cnpj !== "string")
        throw new Error("'cnpj' deve ser string");

    if (cnpj.length !== 14)
        throw new Error("'cnpj' deve ter 14 dígitos");


    if (/^(\d)\1+$/.test(cnpj))
        throw new Error("'cnpj' inválido");


    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0))
        throw new Error("'cnpj' inválido");

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(1))
        throw new Error("'cnpj' inválido");
}

export const checkValidPhoneNumber = (phoneNumber) =>
{
    if(!phoneNumber)
        return;

    if(typeof phoneNumber !== "string")
        throw new Error("'phoneNumber' deve ser string");

    if (!/^\d+$/.test(phoneNumber))
        throw new Error("'phoneNumber' deve conter apenas números");

    if (/^0800\d{6,7}$/.test(phoneNumber))
        return;

    if (/^(0300|0500|0900)\d{6,7}$/.test(phoneNumber))
        return;


    if (/^400\d{4,5}$/.test(phoneNumber))
        return;


    if (phoneNumber.length === 10 || phoneNumber.length === 11) {
        let ddd = phoneNumber.slice(0, 2);

        const dddsValidos = new Set([
            "11", "12", "13", "14", "15", "16", "17", "18", "19",
            "21", "22", "24", "27", "28",
            "31", "32", "33", "34", "35", "37", "38",
            "41", "42", "43", "44", "45", "46",
            "47", "48", "49",
            "51", "53", "54", "55",
            "61", "62", "63", "64", "65", "66", "67", "68", "69",
            "71", "73", "74", "75", "77", "79",
            "81", "82", "83", "84", "85", "86", "87", "88", "89",
            "91", "92", "93", "94", "95", "96", "97", "98", "99"
        ]);

        if (!dddsValidos.has(ddd))
            throw new Error("O DDD de 'phoneNumber' é inválido");

        if (phoneNumber.length === 11 && phoneNumber[2] !== "9")
            throw new Error("'phoneNumber' de 11 dígitos de começar com 9");

        if (phoneNumber.length === 10 && ["0", "1"].includes(phoneNumber[2]))
            throw new Error("'phoneNumber' de 10 dígitos não pode começar com 0 ou 1");

        return;
    }


    throw new Error("Número de telefone inválido para o Brasil");
}

export const checkValidContentType = (contentType) =>
{
    if(!contentType)
        return;

    if (typeof contentType !== "string")
        throw new Error("'contentType' deve ser string");

    const parts = contentType.split("/");

    if(parts.length !== 2)
        throw new Error("'contentType' inválido");

    const [type, subtype] = parts;

    if(!type || !subtype)
        throw new Error("'contentType' inválido");

}