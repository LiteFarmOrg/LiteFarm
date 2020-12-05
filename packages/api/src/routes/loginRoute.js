const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const checkGoogleJwt = require('../middleware/acl/checkGoogleJwt');
router.post('/google', checkGoogleJwt, loginController.loginWithGoogle());
router.post('/', loginController.authenticateUser());
router.get('/user/:email', loginController.getUserNameByUserEmail());

module.exports = router;
