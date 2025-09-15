import express from 'express';
import {
    getUser,
    getUserById,
    register,
    putUser,
    deleteUserById,
    login,
    editEmailOrPassword
} from '../controllers/userController.js';
import {authenticate} from "../middleware/authenticationMiddleware.js";

const router = express.Router();

//GET
router.get('/', authenticate, getUser);
router.get('/firebase', authenticate, login);
router.get('/:id', getUserById);

//REGISTER
router.post('/register/:id', register);

//resetemailpassword
router.post('/resetemailpassword/:id', authenticate, editEmailOrPassword);

//PUT
router.put('/:id', authenticate, putUser);


//DELETE
router.delete('/:id', authenticate, deleteUserById);


export default router;