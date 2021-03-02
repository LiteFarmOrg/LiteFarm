const LocationModel = require('../models/locationModel');
const LocationController = {
  getLocationsByFarm(){
    return async (req, res, next) =>  {
      const { farm_id } = req.params;
      const locations = await LocationModel.query()
        .where({ farm_id })
        .withGraphJoined(`[
          figure.[area, line, point], 
          gate, water_valve, field, buffer_zone, creek, fence, 
          ceremonial_area, residence, ground_water, natural_area,
          greenhouse, barn
        ]`)
      res.status(200).send(locations);
    }
  },
}

module.exports = LocationController;
