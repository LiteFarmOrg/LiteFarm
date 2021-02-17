const baseController = require('../controllers/baseController');
const roleModel = require('../models/roleModel')


class rolesController {
  static getRoles() {
    return async (req, res) => {
      try {
        const data = await roleModel.query().whereNot('role_id', 4);
        res.status(200).send(data);
        if (!data.length) {
          res.sendStatus(404);
        }
      } catch (error) {
        res.status(400).send(error);
      }
    }
  }
}

module.exports = rolesController;
