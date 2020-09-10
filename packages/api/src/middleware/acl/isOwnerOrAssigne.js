const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../../knexfile')[environment];
const knex = Knex(config);

module.exports = async (req, res, next) => {
  const data = Object.keys(req.body).length === 0 ? req.params:  req.body;
  const headers = req.headers;
  const { user_id } = headers;

  if(data.activity_id) {
    const activity = await fromActivity(data.activity_id);
    return sameUser(activity, user_id) ? next() : notAuthorizedResponse(res);
  }
  if(data.user_id) {
    return sameUser(data, user_id) ? next() : notAuthorizedResponse(res);
  }
  // No user relationship
  next();
}

function sameUser(object, user) {
  return object.user_id === user;
}

async function fromActivity(activityId) {
  return await knex('activityLog').where({ activity_id: activityId }).first();
}

function notAuthorizedResponse(res) {
  res.status(403).send('user not authorized to access record from other user');
}
