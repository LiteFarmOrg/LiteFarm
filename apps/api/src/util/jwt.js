import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_EXPIRES_IN = '7d';
const RESET_PASSWORD_TOKEN_EXPIRES_IN = '1d';
const SCHEDULER_TOKEN_EXPIRES_IN = '1d';

const tokenType = {
  access: process.env.JWT_SECRET,
  invite: process.env.JWT_INVITE_SECRET,
  passwordReset: process.env.JWT_RESET_SECRET,
  farm: process.env.JWT_FARM_SECRET,
  scheduler: process.env.JWT_SCHEDULER_SECRET,
};
const expireTime = {
  access: ACCESS_TOKEN_EXPIRES_IN,
  invite: ACCESS_TOKEN_EXPIRES_IN,
  passwordReset: RESET_PASSWORD_TOKEN_EXPIRES_IN,
  farm: ACCESS_TOKEN_EXPIRES_IN,
  scheduler: SCHEDULER_TOKEN_EXPIRES_IN,
};

function createToken(type, payload) {
  return jwt.sign(payload, tokenType[type], {
    expiresIn: expireTime[type],
    algorithm: 'HS256',
  });
}

export { createToken, expireTime, tokenType };
