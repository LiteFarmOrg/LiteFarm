const { Model } = require('objection');
const knex = Model.knex();
const entitiesGetters = {
  farm_expense_id: fromExpense,
  sale_id: fromSale,
  activity_id: fromActivity,
  shift_id: fromShift,
//   user_id: (user_id) => ({ user_id }),
};

const isCreator = ({ params = null, body = null }) => async (req, res, next) => {
  const key = params ? params : body;
  const value = params ? req.params[key] : req.body[key];
  const headers = req.headers;
  const { user_id } = headers;

  const entity = await entitiesGetters[key](value);
  isEntityCreatedBy(entity, user_id) ? next() : notAuthorizedResponse(res);
};

function isEntityCreatedBy({ created_by_user_id }, user_id) {
  return created_by_user_id === user_id;
}

function notAuthorizedResponse(res) {
  res.status(403).send('user not authorized to access record they did not create');
}

async function fromExpense(expenseId) {
  return await knex('farmExpense').where({ farm_expense_id: expenseId }).first();
}

async function fromSale(saleId) {
  return await knex('sale').where({ sale_id: saleId }).first();
}

async function fromActivity(activityId) {
  return await knex('activityLog').where({ activity_id: activityId }).first();
}

async function fromShift(shift_id) {
  return await knex('shift').where({ shift_id }).first();
}

module.exports = isCreator;
