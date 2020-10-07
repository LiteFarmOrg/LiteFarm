const { Model } = require('objection');
const knex = Model.knex();
const entitiesGetters = {
  activity_id: fromActivity,
  shift_id: fromShift,
  user_id: (user_id) => ({ user_id }),
}

module.exports = ({ params = null, body = null }) => async (req, res, next) => {
  const key = params ? params : body;
  const value = params ? req.params[key] : req.body[key];
  const headers = req.headers;
  const { user_id, farm_id } = headers;

  const userIdObjectFromEntity = await entitiesGetters[key](value);
  return sameUser(userIdObjectFromEntity, { user_id, farm_id }) ? next() : notAuthorizedResponse(res);
}

function sameUser(object, { user_id, farm_id }) {
  return object.farm_id ? object.farm_id === farm_id && object.user_id === user_id : object.user_id === user_id;
}

async function fromActivity(activityId) {
  return knex('activityLog').where({ activity_id: activityId }).first();
}


async function fromShift(shiftId) {
  return await knex('shift').where({ shift_id: shiftId }).first();
}

function notAuthorizedResponse(res) {
  res.status(403).send('user not authorized to access record from other user');
}
