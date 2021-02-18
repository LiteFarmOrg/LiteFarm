const { Model } = require('objection');
const knex = Model.knex();
const entitiesGetters = {
  activity_id: fromActivity,
  shift_id: fromShift,
  user_id: (user_id) => ({ user_id }),
};

const isOwnerOrAssignee = ({ params = null, body = null }) => async (req, res, next) => {
  const key = params ? params : body;
  const value = params ? req.params[key] : req.body[key];
  const headers = req.headers;
  const { user_id, farm_id } = headers;

  const userIdObjectFromEntity = await entitiesGetters[key](value);
  return sameUser(userIdObjectFromEntity, { user_id, farm_id }) ? next() : notAuthorizedResponse(res);
};

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

async function isShiftOwnerOrIsAdmin(req, res, next) {
  const { user_id, farm_id } = req.headers;
  const AdminRoles = [1, 2, 5];
  const { role_id } = await knex('userFarm').where({ user_id, farm_id }).first();
  const isUser = sameUser({ user_id, farm_id }, { user_id: req.body.user_id, farm_id: req.body.farm_id });
  if (isUser) {
    next();
    return;
  }
  if (AdminRoles.includes(role_id)) {
    if (req.body.mood !== 'na' && [1, 2].includes(role_id)) {
      res.status(403).send('Owners or managers are not allowed to set mood');
      return;
    }
    next();
    return;
  }
  return res.status(403).send('Worker is not allowed to add shifts to another user');
}

async function isSelfOrAdmin(req, res, next) {
  const { user_id, farm_id } = req.params;
  const AdminRoles = [1, 2, 5];
  req.header.user_id = req.user.user_id;
  req.header.farm_id = farm_id;
  if (user_id === req.user.user_id) {
    return next();
  } else {
    return AdminRoles.includes(req.role) ? next() : res.status(403).send('Worker is not allowed to get shifts of another user');
  }
}

module.exports = {
  isOwnerOrAssignee,
  isShiftOwnerOrIsAdmin,
  isSelfOrAdmin,
};
