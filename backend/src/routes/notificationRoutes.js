import express from 'express';
import {
    getReceivedNotifications,
    getSendedNotifications,
    getNotificationById,
    postNotification,
    deleteNotificationById,
    readNotification,
    getNotification
} from '../controllers/notificationController.js';
import {authenticate} from "../middleware/authenticationMiddleware.js";

const router = express.Router();

//GET
router.get('/', authenticate, getNotification);
router.get('/received', authenticate, getReceivedNotifications);
router.get('/sended', authenticate, getSendedNotifications);
router.get('/:id', authenticate, getNotificationById);

//POST
router.post('/', authenticate, postNotification);

//DELETE
router.delete('/:id', authenticate, deleteNotificationById);

router.put('/read/:id', authenticate, readNotification);

export default router;