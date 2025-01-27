import FarmAddonModel from '../models/farmAddonModel.js';

const farmAddonController = {
  getFarmAddon() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const { addon_id } = req.query;
        const rows = await FarmAddonModel.query().where({ farm_id, addon_id });
        if (!rows.length) {
          return res.sendStatus(404);
        }
        return res.sendStatus(200);
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          error,
        });
      }
    };
  },
};

export default farmAddonController;
