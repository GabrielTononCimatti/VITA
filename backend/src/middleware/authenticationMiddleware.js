import {retrieveUser} from "../models/userModel.js";
import {retrievePerson} from "../models/personModel.js";

export const authenticate = async (req, res, next) =>
{
    let currentUser, currentPerson;
    let token = req.headers.authorization?.split('Bearer ')[1];
    try
    {
        currentUser = await retrieveUser(token);
        currentPerson = await retrievePerson(currentUser.personID.split("/")[1]);
    }
    catch(error)
    {
        console.log("\n\n"+error+"\n\n");
        return res.status(400).send({message:error.message});
    }

    if(!currentUser || !currentPerson)
        return res.status(401).send({message: 'Erro 401: Unauthorized. Acesso negado'});

    req.currentUser = currentUser;
    req.currentPerson = currentPerson;
    next();
}