const express = require('express');
const router = express.Router();
const signUpController = require('../controllers/signUpController');

router.get('/verify_token/:token', signUpController.isEmailTokenValid());

router.patch('/:id', signUpController.signUpViaInvitation());

module.exports = router;
