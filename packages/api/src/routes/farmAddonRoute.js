import express from 'express';
import farmAddonController from '../controllers/farmAddonController.js';

const router = express.Router();

router.get('/', farmAddonController.getFarmAddon());

export default router;
