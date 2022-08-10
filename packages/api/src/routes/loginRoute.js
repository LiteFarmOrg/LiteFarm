import express from 'express';
const router = express.Router();
import loginController from '../controllers/loginController';
import checkGoogleJwt from '../middleware/acl/checkGoogleJwt';

router.post('/google', checkGoogleJwt, loginController.loginWithGoogle());
router.post('/', loginController.authenticateUser());
router.get('/user/:email', loginController.getUserNameByUserEmail());

export default router;
