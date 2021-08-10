const TaskModel = require('../models/taskModel');
const userFarmModel = require('../models/userFarmModel');

const { typesOfTask } = require('./../middleware/validation/task')
const adminRoles = [ 1, 2, 5 ];

const taskController = {

  assignTask() {
    return async (req, res, next) => {
      try {
        const { task_id } = req.params;
        const { user_id } = req.headers;
        const { assignee_user_id } = req.body;
        if (!adminRoles.includes(req.role) && user_id !== assignee_user_id && assignee_user_id !== null) {
          return res.status(403).send('Not authorized to assign other people for this task');
        }
        const { farm_id } = await TaskModel.query().select('location.farm_id').whereNotDeleted()
          .join('location_tasks', 'location_tasks.task_id', 'task.task_id')
          .join('location', 'location.location_id', 'location_tasks.location_id').where('task.task_id', task_id).first();
        let wage = { amount: 0 };
        if (assignee_user_id !== null) {
          const userFarm = await userFarmModel.query().where({ user_id: assignee_user_id, farm_id }).first();
          wage = userFarm.wage;
        }
        const result = await TaskModel.query().context(req.user).findById(task_id).patch({
          assignee_user_id,
          wage_at_moment: wage.amount === 0 ? 0 : wage.amount
        });
        return result ? res.sendStatus(200) : res.status(404).send('Task not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    }
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
            builder.where('due_date', date)
            builder.whereIn('task_id', taskIds);
            if (assignee_user_id !== null) {
              builder.where('assignee_user_id', null)
            }
          })
        available_tasks = available_tasks.map(({ task_id }) => task_id);
        const result = await TaskModel.query().context(req.user).patch({
          assignee_user_id,
          wage_at_moment: wage.amount === 0 ? 0 : wage.amount,
        }).whereIn('task_id', available_tasks);
        return result ? res.status(200).send(available_tasks) : res.status(404).send('Tasks not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    }
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
        data.planned_time = data.due_date;
        if (data.assignee_user_id && !data.wage_at_moment) {
          const { wage } = await userFarmModel.query().where({ user_id: data.assignee_user_id, farm_id }).first();
          data.wage_at_moment = wage.amount;
        }
        const result = await TaskModel.transaction(async trx =>
          await TaskModel.query(trx).context({ user_id: req.user.user_id })
            .upsertGraph(req.body, {
              noUpdate: true,
              noDelete: true,
              noInsert: nonModifiable,
              relate: [ 'locations', 'managementPlans' ],
            }),
        );
        return res.status(200).send(result);
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    }
  },

  getTasksByFarmId() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const tasks = await getTasksForFarm(farm_id);
        const taskIds = tasks.map(({ task_id }) => task_id);
        const graphTasks = await TaskModel.query().withGraphFetched(`
          [locations, managementPlans, taskType]
        `).whereIn('task_id', taskIds);
        if (graphTasks) {
          res.status(200).send(graphTasks);
        }
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });

      }
    }
  },


}

function getNonModifiable(asset) {
  const nonModifiableAssets = typesOfTask.filter(a => a !== asset);
  return [ 'createdByUser', 'updatedByUser', 'location', 'management_plan' ].concat(nonModifiableAssets);
}

function getTasksForFarm(farm_id) {
  return TaskModel.query().select('task.task_id').whereNotDeleted()
    .distinct('task.task_id')
    .join('location_tasks', 'location_tasks.task_id', 'task.task_id')
    .join('location', 'location.location_id', 'location_tasks.location_id')
    .join('userFarm', 'userFarm.farm_id', '=', 'location.farm_id')
    .where('userFarm.farm_id', farm_id);
}

module.exports = taskController;
