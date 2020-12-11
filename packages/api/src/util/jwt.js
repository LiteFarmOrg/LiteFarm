const { sign } = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRES_IN = '7d';
const RESET_PASSWORD_TOKEN_EXPIRES_IN = '1d';

const createAccessToken = async (user) => {
  return sign(user, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

const createAccessTokenSync = (user) => {
  return sign(user, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

const createResetPasswordToken = async (user) => {
  return sign(user, process.env.RESET_PASSWORD_JWT_PRIVATE_KEY, {
    expiresIn: RESET_PASSWORD_TOKEN_EXPIRES_IN,
    algorithm: 'RS256',
  });
};

module.exports = {
  createAccessToken,
  createAccessTokenSync,
  createResetPasswordToken
}