const { sign } = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRES_IN = '7d';
const RESET_PASSWORD_TOKEN_EXPIRES_IN = '1d';
const tokenType = {
  access: process.env.JWT_SECRET,
  invite: process.env.JWT_INVITE_SECRET,
  passwordReset: process.env.JWT_RESET_SECRET,
}
const expireTime = {
  access: ACCESS_TOKEN_EXPIRES_IN,
  invite: ACCESS_TOKEN_EXPIRES_IN,
  passwordReset: RESET_PASSWORD_TOKEN_EXPIRES_IN,
}

function createToken(type, payload) {
  return sign(payload, tokenType[type], {
    expiresIn: expireTime[type],
    algorithm: 'HS256',
  });
}

module.exports = {
  createToken,
  expireTime,
  tokenType,
}
