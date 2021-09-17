const { Model } = require('objection');
const knex = Model.knex();
const typesOfTask = [
  'soil_amendment_task',
  'pest_control_task',
  'irrigation_task',
  'scouting_task',
  'soil_task',
  'field_work_task',
  'harvest_task',
  'plant_task',
  'cleaning_task',
];


const modelMapping = {
  soil_amendment_task: modelValidation('soil_amendment_task'),
  pest_control_task: modelValidation('pest_control_task'),
  irrigation_task: modelValidation('irrigation_task'),
  scouting_task: modelValidation('scouting_task'),
  soil_task: modelValidation('soil_task'),
  field_work_task: modelValidation('field_work_task'),
  harvest_task: modelValidation('harvest_task'),
  plant_task: modelValidation('plant_task'),
  transplant_task: modelValidation('transplant_task'),
  cleaning_task: modelValidation('cleaning_task'),
  custom_task: modelValidation('custom_task'),
};

function modelValidation(asset) {
  return (req, res, next) => {
    const data = req.body;
    if(!data) {
      return res.status(400).send({
        message: 'Task is a required property',
      });
    }
    const nonModifiable = typesOfTask.filter(p => p !== asset);
    const isTryingToModifyOtherAssets = Object.keys(data).some(k => nonModifiable.includes(k));
    !isTryingToModifyOtherAssets ? next() : res.status(400).send({
      message: 'You are trying to modify an unallowed object',
    });
  };
}

async function isWorkerToSelfOrAdmin(req, res, next) {
  const { farm_id } = req.headers;
  const { user_id } = req.user;
  const AdminRoles = [1, 2, 5];
  const { role_id } = await knex('userFarm').where({ user_id, farm_id }).first();
  if (AdminRoles.includes(role_id)) {
    next();
    return;
  }
  if(!!req.body.wage_at_moment || req.body.assignee_user_id !== user_id) {
    return res.status(403).send(req.body.wage_at_moment ? 'Worker is not allowed to modify its wage' : 'Worker is not allowed to add tasks to another user');
  }
  next();
}

module.exports = {
  modelMapping,
  typesOfTask,
  isWorkerToSelfOrAdmin,
};
