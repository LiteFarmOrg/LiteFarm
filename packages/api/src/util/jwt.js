const { sign } = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRES_IN = '7d';
const RESET_PASSWORD_TOKEN_EXPIRES_IN = '1d';

const createAccessToken = async (payload) => {
  return sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

const createAccessTokenSync = (payload) => {
  return sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

const createResetPasswordToken = async (payload) => {
  return sign(payload, process.env.RESET_PASSWORD_JWT_PRIVATE_KEY, {
    expiresIn: RESET_PASSWORD_TOKEN_EXPIRES_IN,
    algorithm: 'RS256',
  });
};

module.exports = {
  createAccessToken,
  createAccessTokenSync,
  createResetPasswordToken
}