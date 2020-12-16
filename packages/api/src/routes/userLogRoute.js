const express = require('express');
const router = express.Router();
const userLogController = require('../controllers/userLogController');
router.post('/', userLogController.addUserLog());

module.exports = router;
