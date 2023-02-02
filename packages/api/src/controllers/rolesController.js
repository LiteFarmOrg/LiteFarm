import RoleModel from '../models/roleModel.js';

const rolesController = {
  getRoles() {
    return async (req, res, next) => {
      try {
        const data = await RoleModel.query().whereNot('role_id', 4);
        res.status(200).send(data);
        if (!data.length) {
          res.sendStatus(404);
        }
      } catch (error) {
        next({ status: 400, error });
      }
    };
  },
};

export default rolesController;
