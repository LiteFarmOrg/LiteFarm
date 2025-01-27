import express from 'express';
import checkScope from '../middleware/acl/checkScope.js';
import farmAddonController from '../controllers/farmAddonController.js';

const router = express.Router();

router.get('/', checkScope(['get:addon']), farmAddonController.getFarmAddon());

export default router;
