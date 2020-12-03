const { sign } = require('jsonwebtoken');

const createAccessToken = async (user) => {
  return sign(user, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const createAccessTokenSync = (user) => {
  return sign(user, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = {
  createAccessToken,
  createAccessTokenSync,
}