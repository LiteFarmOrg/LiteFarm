import { OAuth2Client } from 'google-auth-library';
const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID;
const client = new OAuth2Client(client_id);

// Token returned from the Sign in with Google button on main login page
async function checkGoogleJwt(req, res, next) {
  const authorization = req.headers['authorization'];
  if (!authorization) {
    return res.status(401).send('Not authenticated');
  }
  const token = authorization.replace('Bearer ', '');

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: client_id,
    });
    req.auth = ticket.getPayload();
    return next();
  } catch (e) {
    console.log(e);
    return res.status(401).send('Not authenticated');
  }
}

export default checkGoogleJwt;
