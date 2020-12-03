const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/google', checkGoogleJwt, loginController.loginWithGoogle());
router.post('/', loginController.authenticateUser());

module.exports = router;
