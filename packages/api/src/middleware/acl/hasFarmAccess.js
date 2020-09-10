const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../../knexfile')[environment];
const knex = Knex(config);
module.exports = async (req, res, next) => {
  const data = Object.keys(req.body).length === 0 ? req.params:  req.body;
  const headers = req.headers;
  const { farm_id } = headers;
  if(data.field_id) {
    const field = await fromField(data.field_id);
    return sameFarm(field, farm_id) ? next() : notAuthorizedResponse(res);
  }
  if(data.farm_id) {
    return sameFarm(data, farm_id) ? next() : notAuthorizedResponse(res);
  }
  // It doesn't hold farm relationships
  next();
}


async function fromField(fieldId) {
  return await knex('field').where({ field_id: fieldId }).first();
}

function sameFarm(object, farm){
  return object.farm_id === farm;
}

function notAuthorizedResponse(res) {
  res.status(403).send('user not authorized to access farm');
}
