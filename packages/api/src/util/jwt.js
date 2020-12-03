const { sign } = require('jsonwebtoken');

const createAccessToken = async (user) => {
  return sign(user, process.env.JWT_SECRET, {
    expiresIn: '7d',
    // algorithm: 'RS256',
  });
};

const createAccessTokenSync = (user) => {
  return sign(user, process.env.JWT_SECRET, {
    expiresIn: '7d',
    // algorithm: 'RS256',
  });
};

module.exports = {
  createAccessToken,
  createAccessTokenSync,
}