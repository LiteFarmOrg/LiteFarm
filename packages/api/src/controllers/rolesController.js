const baseController = require('../controllers/baseController');
const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];
const knex = Knex(config)

class rolesController extends baseController {
  static getRoles() {
    return async (req, res) => {
      try {
        const data = await knex('role').whereNot('role_id', 4);
        res.status(200).send(data);
        if (!data.length) {
          res.sendStatus(404)
        }
      }
      catch (error) {
        // handle more exceptions
        res.status(400).send(error);
      }
    }
  }
}

module.exports = rolesController;
