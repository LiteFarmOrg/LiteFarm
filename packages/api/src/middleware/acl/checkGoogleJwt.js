import { OAuth2Client } from 'google-auth-library';
const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID;
const client = new OAuth2Client(client_id);

async function checkGoogleJwt(req, res, next) {
  const authorization = req.headers['authorization'];
  if (!authorization) {
    return res.status(401).send('Not authenticated');
  }
  const token = authorization.replace('Bearer ', '');

  // For implicit flow from @react-oauth useGoogleLogin() hook from the email invite view
  if (req.body.isAccessToken) {
    try {
      const tokenInfo = await client.getTokenInfo(token);
      req.user = { email: tokenInfo.email, sub: tokenInfo.sub };
      return next();
    } catch (error) {
      console.error(error);
    }
  }

  // Original flow & Sign in with Google Button on main login page
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: client_id,
    });
    req.user = ticket.getPayload();
    return next();
  } catch (e) {
    console.log(e);
    return res.status(401).send('Not authenticated');
  }
}

export default checkGoogleJwt;
