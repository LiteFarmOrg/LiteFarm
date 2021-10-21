const TaskModel = require('../models/taskModel');
const userFarmModel = require('../models/userFarmModel');
const managementPlanModel = require('../models/managementPlanModel');
const managementTasksModel = require('../models/managementTasksModel');
const transplantTaskModel = require('../models/transplantTaskModel');
const plantTaskModel = require('../models/plantTaskModel');
const plantingManagementPlanModel = require('../models/plantingManagementPlanModel');
const HarvestUse = require('../models/harvestUseModel');

const { typesOfTask } = require('./../middleware/validation/task');
const adminRoles = [1, 2, 5];

const taskController = {

  assignTask() {
    return async (req, res, next) => {
      try {
        const { task_id } = req.params;
        const { user_id, farm_id } = req.headers;
        const { assignee_user_id } = req.body;
        if (!adminRoles.includes(req.role) && user_id !== assignee_user_id && assignee_user_id !== null) {
          return res.status(403).send('Not authorized to assign other people for this task');
        }

        let wage = { amount: 0 };
        if (assignee_user_id !== null) {
          const userFarm = await userFarmModel.query().where({ user_id: assignee_user_id, farm_id }).first();
          wage = userFarm.wage;
        }
        const checkTaskStatus = await TaskModel.query().select('completed_time', 'abandoned_time').where({ task_id }).first();
        if (checkTaskStatus.completed_time || checkTaskStatus.abandoned_time) {
          return res.status(406).send('Task has already been completed or abandoned');
        }
        const result = await TaskModel.query().context(req.user).findById(task_id).patch({
          assignee_user_id,
          wage_at_moment: wage.amount === 0 ? 0 : wage.amount,
        });
        return result ? res.sendStatus(200) : res.status(404).send('Task not found');
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
      }
    };
  },

  assignAllTasksOnDate() {
    return async (req, res, next) => {
      try {
        const { user_id, farm_id } = req.headers;
        const { assignee_user_id, date } = req.body;
        if (!adminRoles.includes(req.role) && user_id !== assignee_user_id && assignee_user_id !== null) {
          return res.status(403).send('Not authorized to assign other people for this task');
        }
        const tasks = await getTasksForFarm(farm_id);
        let wage = { amount: 0 };
        if (assignee_user_id !== null) {
          const userFarm = await userFarmModel.query().where({ user_id: assignee_user_id, farm_id }).first();
          wage = userFarm.wage;
        }
        const taskIds = tasks.map(({ task_id }) => task_id);
        let available_tasks = await TaskModel.query().context(req.user)
          .select('task_id')
          .where((builder) => {
            builder.where('due_date', date);
            builder.whereIn('task_id', taskIds);
            if (assignee_user_id !== null) {
              builder.where('assignee_user_id', null);
            }
            builder.where('completed_time', null);
            builder.where('abandoned_time', null);
          });
        available_tasks = available_tasks.map(({ task_id }) => task_id);
        const result = await TaskModel.query().context(req.user).patch({
          assignee_user_id,
          wage_at_moment: wage.amount === 0 ? 0 : wage.amount,
        }).whereIn('task_id', available_tasks);
        return result ? res.status(200).send(available_tasks) : res.status(404).send('Tasks not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },

  abandonTask() {
    return async (req, res, next) => {
      try {
        const { task_id } = req.params;
        const { user_id } = req.headers;
        const { abandonment_reason, other_abandonment_reason, abandonment_notes, happiness, duration } = req.body;

        const { owner_user_id, assignee_user_id } = await TaskModel.query()
          .select('owner_user_id', 'assignee_user_id')
          .where({ task_id }).first();
        const isUserTaskOwner = user_id === owner_user_id;
        const isUserTaskAssignee = user_id === assignee_user_id;
        //TODO: move to middleware
        // cannot abandon task if user is worker and not assignee and not creator
        if (!adminRoles.includes(req.role) && !isUserTaskOwner && !isUserTaskAssignee) {
          return res.status(403).send('A worker who is not assignee or owner of task cannot abandon it');
        }
        const result = await TaskModel.query().context(req.user).findById(task_id).patch({
          abandoned_time: new Date(Date.now()),
          abandonment_reason,
          other_abandonment_reason,
          abandonment_notes,
          happiness,
          duration,
        });
        return result ? res.sendStatus(200) : res.status(404).send('Task not found');
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
      }
    };
  },

  createTask(typeOfTask) {
    const nonModifiable = getNonModifiable(typeOfTask);
    return async (req, res, next) => {
      try {
        // OC: the "noInsert" rule will not fail if a relationship is present in the graph.
        // it will just ignore the insert on it. This is just a 2nd layer of protection
        // after the validation middleware.
        const data = req.body;
        const { farm_id } = req.headers;
        const { user_id } = req.user;
        data.planned_time = data.due_date;
        data.owner_user_id = user_id;
        if (data.assignee_user_id && !data.wage_at_moment) {
          const { wage } = await userFarmModel.query().where({ user_id: data.assignee_user_id, farm_id }).first();
          data.wage_at_moment = wage.amount;
        }
        const result = await TaskModel.transaction(async trx => {
          const { task_id } = await TaskModel.query(trx).context({ user_id: req.user.user_id })
            .upsertGraph(req.body, {
              noUpdate: true,
              noDelete: true,
              noInsert: nonModifiable,
              relate: ['locations', 'managementPlans'],
            });
          const [task] = await TaskModel.query(trx).withGraphFetched(`
          [locations, managementPlans, taskType, soil_amendment_task, irrigation_task,scouting_task, 
          field_work_task, cleaning_task, pest_control_task, soil_task, harvest_task, plant_task]
          `).where({ task_id });
          return removeNullTypes(task);
        });
        return res.status(201).send(result);
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    };
  },

  createHarvestTasks() {
    const nonModifiable = getNonModifiable('harvest_task');

    return async (req, res, next) => {
      try {
        const harvest_tasks = req.body;
        const { farm_id } = req.headers;
        const { user_id } = req.user;
        //TODO: use cases of planned_time and due_date

        const result = await TaskModel.transaction(async trx => {
          const result = [];
          for (const harvest_task of harvest_tasks) {
            harvest_task.planned_time = harvest_task.due_date;
            harvest_task.owner_user_id = user_id;
            if (harvest_task.assignee_user_id && !harvest_task.wage_at_moment) {
              const { wage } = await userFarmModel.query().where({
                user_id: harvest_task.assignee_user_id,
                farm_id,
              }).first();
              harvest_task.wage_at_moment = wage.amount;
            }

            const task = await TaskModel.query(trx).context({ user_id: req.user.user_id })
              .upsertGraph(harvest_task, {
                noUpdate: true,
                noDelete: true,
                noInsert: nonModifiable,
                relate: ['locations', 'managementPlans'],
              });
            result.push(removeNullTypes(task));
          }
          return result;
        });
        return res.status(201).send(result);
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
      }
    };
  },

  createTransplantTask() {
    const nonModifiable = getNonModifiable('transplant_task');

    return async (req, res, next) => {
      try {
        const transplant_task = req.body;
        const { farm_id } = req.headers;
        const { user_id } = req.user;
        //TODO: use cases of planned_time and due_date

        const result = await TaskModel.transaction(async trx => {
          transplant_task.planned_time = transplant_task.due_date;
          transplant_task.owner_user_id = user_id;
          if (transplant_task.assignee_user_id && !transplant_task.wage_at_moment) {
            const { wage } = await userFarmModel.query().where({
              user_id: transplant_task.assignee_user_id,
              farm_id,
            }).first();
            transplant_task.wage_at_moment = wage.amount;
          }
          //TODO: noInsert on planting_management_plan planting methods LF-1864
          return await TaskModel.query(trx).context({ user_id: req.user.user_id })
            .upsertGraph(transplant_task, {
              noUpdate: true,
              noDelete: true,
              noInsert: nonModifiable,
            });
        });
        return res.status(201).send(result);
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
      }
    };
  },

  completeTask(typeOfTask) {
    const nonModifiable = getNonModifiable(typeOfTask);
    return async (req, res, next) => {
      try {
        const data = req.body;
        const { user_id } = req.headers;
        const { task_id } = req.params;
        const { assignee_user_id } = await TaskModel.query().context(req.user).findById(task_id);
        if (assignee_user_id !== user_id) {
          return res.status(403).send('Not authorized to complete other people\'s task');
        }
        const result = await TaskModel.transaction(async trx => {
          const task = await TaskModel.query(trx).context({ user_id: req.user.user_id })
            .upsertGraph({ task_id: parseInt(task_id), ...data }, {
              noUpdate: nonModifiable,
              noDelete: true,
              noInsert: true,
            });

          await patchManagementPlanStartDate(trx, req, typeOfTask);

          return task;
        });
        if (result) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send('Task not found');
        }
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    };
  },


  completeHarvestTask() {
    const nonModifiable = getNonModifiable('harvest_task');
    return async (req, res, next) => {
      try {
        const data = req.body;
        const { user_id } = req.headers;
        const task_id = parseInt(req.params.task_id);
        const { assignee_user_id } = await TaskModel.query().context(req.user).findById(task_id);
        if (assignee_user_id !== user_id) {
          return res.status(403).send('Not authorized to complete other people\'s task');
        }
        const harvest_uses = data.harvest_uses.map(harvest_use => ({ ...harvest_use, task_id }));
        const task = data.task;


        const result = await TaskModel.transaction(async trx => {
          const result = {};
          const updated_task = await TaskModel.query(trx).context({ user_id: req.user.user_id })
            .upsertGraph({ task_id: parseInt(task_id), ...task }, {
              noUpdate: nonModifiable,
              noDelete: true,
              noInsert: true,
            });
          result.task = removeNullTypes(updated_task);
          const updated_harvest_uses = await HarvestUse.query(trx).context({ user_id: req.user.user_id })
            .insert(harvest_uses);
          result.harvest_uses = updated_harvest_uses;
          await patchManagementPlanStartDate(trx, req, 'harvest_task');

          return result;
        });

        if (Object.keys(result).length > 0) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send('Task not found');
        }
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    };
  },

  getTasksByFarmId() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const tasks = await getTasksForFarm(farm_id);
        const taskIds = tasks.map(({ task_id }) => task_id);
        const graphTasks = await TaskModel.query().whereNotDeleted().withGraphFetched(`
          [locations, managementPlans, soil_amendment_task, field_work_task, cleaning_task, pest_control_task, harvest_task.[harvest_use], plant_task, transplant_task]
        `).whereIn('task_id', taskIds);
        const filteredTasks = graphTasks.map(removeNullTypes);
        if (graphTasks) {
          res.status(200).send(filteredTasks);
        }
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });

      }
    };
  },

  //TODO: evaluate getHarvestUsesByFarmId use cases
  getHarvestUsesByFarmId() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const harvest_uses = await HarvestUse.query().select()
          .join('task', 'harvest_use.task_id', 'task.task_id')
          .join('location_tasks', 'location_tasks.task_id', 'task.task_id')
          .join('location', 'location.location_id', 'location_tasks.location_id')
          .where('location.farm_id', farm_id);
        if (harvest_uses) {
          return res.status(200).send(harvest_uses);
        }
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    };
  },

};

//TODO: tests where location and management_plan inserts should fail

function getNonModifiable(asset) {
  const nonModifiableAssets = typesOfTask.filter(a => a !== asset);
  return ['createdByUser', 'updatedByUser', 'location', 'management_plan'].concat(nonModifiableAssets);
}

function removeNullTypes(task, i, arr) {
  const filtered = Object.keys(task)
    .filter((k) => typesOfTask.includes(k))
    .reduce((reducer, k) => ({ ...reducer, [k]: task[k] === null ? undefined : task[k] }), {});
  return { ...task, ...filtered };
}

//TODO: optimize after plant_task and transplant_task refactor
async function getTasksForFarm(farm_id) {
  const [managementTasks, locationTasks, plantTasks, transplantTasks] = await Promise.all([
    TaskModel.query().select('task.task_id').whereNotDeleted()
      .distinct('task.task_id')
      .join('management_tasks', 'management_tasks.task_id', 'task.task_id')
      .join('planting_management_plan', 'management_tasks.planting_management_plan_id', 'planting_management_plan.planting_management_plan_id')
      .join('management_plan', 'planting_management_plan.management_plan_id', 'management_plan.management_plan_id')
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .where('crop_variety.farm_id', farm_id),
    TaskModel.query().select('task.task_id').whereNotDeleted()
      .distinct('task.task_id')
      .join('location_tasks', 'location_tasks.task_id', 'task.task_id')
      .join('location', 'location.location_id', 'location_tasks.location_id')
      .where('location.farm_id', farm_id),
    plantTaskModel.query().select('plant_task.task_id')
      .join('planting_management_plan', 'planting_management_plan.planting_management_plan_id', 'plant_task.planting_management_plan_id')
      .join('management_plan', 'management_plan.management_plan_id', 'planting_management_plan. management_plan_id')
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .where('crop_variety.farm_id', farm_id),
    transplantTaskModel.query().select('transplant_task.task_id')
      .join('planting_management_plan', 'planting_management_plan.planting_management_plan_id', 'transplant_task.planting_management_plan_id')
      .join('management_plan', 'management_plan.management_plan_id', 'planting_management_plan. management_plan_id')
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .where('crop_variety.farm_id', farm_id),

  ]);
  return [...managementTasks, ...locationTasks, ...plantTasks, ...transplantTasks];
}

async function getManagementPlans(task_id, typeOfTask) {
  switch (typeOfTask) {
  case 'plant_task':
    return plantTaskModel.query()
      .join('planting_management_plan', 'plant_task.planting_management_plan_id', 'planting_management_plan.planting_management_plan_id')
      .where({ task_id }).select('*');

  case 'transplant_task':
    return transplantTaskModel.query()
      .join('planting_management_plan', 'transplant_task.planting_management_plan_id', 'planting_management_plan.planting_management_plan_id')
      .where({ task_id }).select('*');
  default:
    return managementTasksModel.query().select('planting_management_plan.management_plan_id')
      .join('planting_management_plan', 'planting_management_plan.planting_management_plan_id', 'management_tasks.planting_management_plan_id')
      .where('task_id', task_id);
  }
}

async function patchManagementPlanStartDate(trx, req, typeOfTask) {
  const data = req.body;
  const task_id = parseInt(req.params.task_id);
  const management_plans = await getManagementPlans(task_id, typeOfTask);
  const management_plan_ids = management_plans.map(({ management_plan_id }) => management_plan_id);
  if (management_plan_ids.length > 0) {
    await managementPlanModel.query(trx).context(req.user).patch({ start_date: data.completed_time })
      .whereIn('management_plan_id', management_plan_ids)
      .where('start_date', null).returning('*');
  }
}

module.exports = taskController;
