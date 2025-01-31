import knex from '../../util/knex.js';
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
  'animal_movement_task',
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
  animal_movement_task: modelValidation('animal_movement_task'),
  custom_task: modelValidation('custom_task'),
};

function modelValidation(asset) {
  return (req, res, next) => {
    const data = req.body;
    if (!data) {
      return res.status(400).send({
        message: 'Task is a required property',
      });
    }
    const nonModifiable = typesOfTask.filter((p) => p !== asset);
    const isTryingToModifyOtherAssets = Object.keys(data).some((k) => nonModifiable.includes(k));
    !isTryingToModifyOtherAssets
      ? next()
      : res.status(400).send({
          message: 'You are trying to modify an unallowed object',
        });
  };
}

function isWorkerToSelfOrAdmin({ hasManyTasks = false } = {}) {
  function checkWageAndAssignee(task, user_id) {
    if (task.wage_at_moment) {
      throw new Error('Worker is not allowed to modify its wage');
    } else if (task.assignee_user_id && task.assignee_user_id !== user_id) {
      throw new Error('Worker is not allowed to add tasks to another user');
    }
  }

  function checkReq(req, res, next) {
    const { user_id } = req.auth;
    try {
      if (hasManyTasks) {
        req.body.map((task) => checkWageAndAssignee(task, user_id));
      } else {
        checkWageAndAssignee(req.body, user_id);
      }
    } catch (e) {
      return res.status(403).send(e.message);
    }
    return next();
  }

  return async (req, res, next) => {
    const { farm_id } = req.headers;
    const { user_id } = req.auth;
    const AdminRoles = [1, 2, 5];
    const { role_id } = await knex('userFarm').where({ user_id, farm_id }).first();
    if (AdminRoles.includes(role_id)) {
      next();
      return;
    }
    return checkReq(req, res, next);
  };
}

export { modelMapping, typesOfTask, isWorkerToSelfOrAdmin };
