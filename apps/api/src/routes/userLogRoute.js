import express from 'express';
const router = express.Router();
import userLogController from '../controllers/userLogController.js';
router.post('/', userLogController.addUserLog());

export default router;
