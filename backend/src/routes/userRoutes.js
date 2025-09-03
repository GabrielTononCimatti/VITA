import express from 'express';
import {getUser, getUserById, register, putUser, deleteUserById} from '../controllers/userController.js';
import {authenticate} from "../middleware/authenticationMiddleware.js";

const router = express.Router();

//GET
router.get('/', authenticate, getUser);
router.get('/:id', authenticate, getUserById);

//REGISTER
router.post('/register/:id', register);

//PUT
router.put('/:id', authenticate, putUser);


//DELETE
router.delete('/:id', authenticate, deleteUserById);


export default router;