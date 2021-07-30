const TaskModel = require('../models/taskModel');

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
        message: 'Not implemented yet'
      });
    }
  },
}

module.exports = taskController;