import express from 'express';
const router = express.Router();
import loginController from '../controllers/loginController.js';
import checkGoogleJwt from '../middleware/acl/checkGoogleJwt.js';
import checkJwt from '../middleware/acl/checkJwt.js';

router.post('/google', checkGoogleJwt, loginController.loginWithGoogle());
router.post('/', loginController.authenticateUser());
router.get('/user/:email', loginController.getUserNameByUserEmail());
// This router is mounted before the global checkJwt in server.ts,
// so the middleware is attached here to make the endpoint require a login token
router.post('/dashboard/ticket', checkJwt, loginController.dashboardIssueTicket());
router.post('/dashboard/exchange', loginController.dashboardExchange());

export default router;
