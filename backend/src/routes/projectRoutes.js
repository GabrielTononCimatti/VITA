import express from 'express';
import {getProject, getProjectById, postProject, putProject, deleteProjectById, deleteStageById, advanceStage, returnStage} from '../controllers/projectController.js';
import {authenticate} from "../middleware/authenticationMiddleware.js";

const router = express.Router();

//GET
router.get('/', authenticate, getProject);
router.get('/:id', authenticate, getProjectById);

//POST
router.post('/', authenticate,postProject);

//PUT
router.put('/:id', authenticate, putProject);


//DELETE
router.delete('/:id', authenticate, deleteProjectById);
router.delete('/:projectID/stage/:stageID', authenticate, deleteStageById);


//MISC
router.put('/:id/advance', authenticate, advanceStage);
router.put('/:id/return', authenticate, returnStage);


export default router;