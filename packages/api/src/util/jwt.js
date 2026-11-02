import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_EXPIRES_IN = '7d';
const RESET_PASSWORD_TOKEN_EXPIRES_IN = '1d';
const SCHEDULER_TOKEN_EXPIRES_IN = '1d';
const DASHBOARD_TICKET_EXPIRES_IN = '30s';
const SOIL_LAB_RESULT_TOKEN_EXPIRES_IN = '8h';

const tokenType = {
  access: process.env.JWT_SECRET,
  invite: process.env.JWT_INVITE_SECRET,
  passwordReset: process.env.JWT_RESET_SECRET,
  farm: process.env.JWT_FARM_SECRET,
  scheduler: process.env.JWT_SCHEDULER_SECRET,
  dashboard: process.env.JWT_DASHBOARD_SECRET,
  soilLabResult: process.env.JWT_DASHBOARD_API_SECRET,
};
const expireTime = {
  access: ACCESS_TOKEN_EXPIRES_IN,
  invite: ACCESS_TOKEN_EXPIRES_IN,
  passwordReset: RESET_PASSWORD_TOKEN_EXPIRES_IN,
  farm: ACCESS_TOKEN_EXPIRES_IN,
  scheduler: SCHEDULER_TOKEN_EXPIRES_IN,
  dashboard: DASHBOARD_TICKET_EXPIRES_IN,
  soilLabResult: SOIL_LAB_RESULT_TOKEN_EXPIRES_IN,
};

function createToken(type, payload) {
  return jwt.sign(payload, tokenType[type], {
    expiresIn: expireTime[type],
    algorithm: 'HS256',
  });
}

export { createToken, expireTime, tokenType };
