import { OAuth2Client } from 'google-auth-library';
const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID;
const client = new OAuth2Client(client_id);

// Token returned from the @react-oauth useGoogleLogin() hook in the email invite view
async function checkGoogleAccessToken(req, res, next) {
  const authorization = req.headers['authorization'];
  if (!authorization) {
    return res.status(401).send('Not authenticated');
  }
  const token = authorization.replace('Bearer ', '');

  try {
    const tokenInfo = await client.getTokenInfo(token);
    req.user = { email: tokenInfo.email, sub: tokenInfo.sub };
    return next();
  } catch (error) {
    console.error(error);
  }
}

export default checkGoogleAccessToken;
