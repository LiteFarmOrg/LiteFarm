const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const checkScope = require('../middleware/acl/checkScope');

router.get('/', rolesController.getRoles());

module.exports = router;
