import express from 'express';
const router = express.Router();
import rolesController from '../controllers/rolesController.js';

router.get('/', rolesController.getRoles());

export default router;
