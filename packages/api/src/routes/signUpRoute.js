const express = require('express');
const router = express.Router();
const signUpController = require('../controllers/signUpController');

router.get('/verify_token/:token/farm/:farm_id/user/:user_id', signUpController.isEmailTokenValid());

router.patch('/:id', signUpController.signUpViaInvitation());

module.exports = router;
