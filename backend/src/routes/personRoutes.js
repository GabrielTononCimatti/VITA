import express from 'express';
import {getPerson, getPersonById, postPerson, putPerson, deletePersonById} from '../controllers/personController.js';
import {authenticate} from "../middleware/authenticationMiddleware.js";

const router = express.Router();

//GET
router.get('/', authenticate, getPerson);
router.get('/:id', authenticate, getPersonById);

//POST
router.post('/', authenticate, postPerson);

//PUT
router.put('/:id', authenticate, putPerson);

//DELETE
router.delete('/:id', authenticate, deletePersonById);


export default router;