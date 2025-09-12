import express from 'express';
import {getPerson, getPersonById, postPerson, requestChanges, putPerson, deletePersonById} from '../controllers/personController.js';
import {authenticate} from "../middleware/authenticationMiddleware.js";

const router = express.Router();

//GET
router.get('/', authenticate, getPerson);
router.get('/:id', authenticate, getPersonById);

//POST
router.post('/', authenticate, postPerson);
router.post('/requestchanges', authenticate, requestChanges);

//PUT
router.put('/:id', authenticate, putPerson);

//DELETE
router.delete('/:id', authenticate, deletePersonById);


export default router;