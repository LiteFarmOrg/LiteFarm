const TaskModel = require('../models/taskModel');
const { typesOfTask } = require('./../middleware/validation/task')
const taskController = {

  assignTask() {
    return async (req, res, next) => {
      try {
        const { task_id } = req.params;
        const { user_id } = req.headers;
        const { assignee_user_id, is_admin } = req.body;
        if (!is_admin && user_id !== assignee_user_id) {
          return res.status(403).send('Not authorized to assign other people for this task');
        }
        const result = await TaskModel.query().context(req.user).findById(task_id).patch(
          {assignee_user_id: assignee_user_id}
        );
        return result ? res.sendStatus(200) : res.status(404).send('Task not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    }
  },

  assignAllTasksOnDate() {
    return async (req, res, next) => {

      return res.status(400).json({
        message: 'Not implemented yet',
      });
    }
  },

  createTask(typeOfTask) {
    const nonModifiable = getNonModifiable(typeOfTask);
    return async (req, res, next) => {
      try {
        // OC: the "noInsert" rule will not fail if a relationship is present in the graph.
        // it will just ignore the insert on it. This is just a 2nd layer of protection
        // after the validation middleware.
        const result = await TaskModel.transaction(async trx =>
          await TaskModel.query(trx).context({ user_id: req.user.user_id })
            .upsertGraph(req.body, { noUpdate: true, noDelete: true, noInsert: nonModifiable, relate: ['locations', 'managementPlans'] })
        );
        return res.status(200).send(result);
      } catch(error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    }
  }

}

function getNonModifiable(asset) {
  const nonModifiableAssets = typesOfTask.filter(a => a !== asset);
  return [ 'createdByUser', 'updatedByUser', 'location', 'management_plan'].concat(nonModifiableAssets);
}


module.exports = taskController;
