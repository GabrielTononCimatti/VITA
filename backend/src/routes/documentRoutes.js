import express from 'express';
import {getAllDocuments, getDocumentByStage, getDocumentById, postDocument, deleteDocumentById} from '../controllers/documentController.js';
import {authenticate} from "../middleware/authenticationMiddleware.js";
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

//GET
router.get('/', authenticate, getAllDocuments);
router.get('/project/:projectID/stage/:stageID', authenticate, getDocumentByStage);
router.get('/:id', authenticate, getDocumentById);

//POST
router.post('/', authenticate, upload.single("file"), postDocument);

//DELETE
router.delete('/:id', authenticate, deleteDocumentById);

export default router;