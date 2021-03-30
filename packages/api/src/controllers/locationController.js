const LocationModel = require('../models/locationModel');
const baseController = require('./baseController');
const { figureMapping, assets, figures } = require('../middleware/validation/location');

const LocationController = {
  getLocationsByFarm() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      const locations = await LocationModel.query()
        .where({ farm_id }).andWhere({ deleted: false })
        .withGraphJoined(`[
          figure.[area, line, point], 
          gate, water_valve, field, garden, buffer_zone, watercourse, fence, 
          ceremonial_area, residence, surface_water, natural_area,
          greenhouse, barn, farm_site_boundary
        ]`)
      return res.status(200).send(locations);
    }
  },

  deleteLocation() {
    return async (req, res, next) => {
      const { location_id } = req.params;
      try {
        const isDeleted = await baseController.delete(LocationModel, location_id, req);
        return res.sendStatus(isDeleted ? 200 : 400);
      } catch (error) {
        return res.status(400).json({
          error,
        });
      }
    }
  },

  createLocation(asset) {
    const nonModifiable = getNonModifiable(asset);
    return async (req, res, next) => {
      try {
        // OC: the "noInsert" rule will not fail if a relationship is present in the graph.
        // it will just ignore the insert on it. This is just a 2nd layer of protection
        // after the validation middleware.
        await LocationModel.transaction(async trx => {
          const result = await LocationModel.query(trx).context({ user_id: req.user.user_id }).upsertGraph(
            req.body, { noUpdate: true, noDelete: true, noInsert: nonModifiable });
          return res.status(200).send(result);
        });
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    }
  },

  updateLocation(asset) {
    const nonModifiable = getNonModifiable(asset);
    return async (req, res, next) => {
      try {
        await LocationModel.transaction(async trx => {
          const result = await LocationModel.query(trx).context({ user_id: req.user.user_id }).upsertGraph(
            { ...req.body, location_id: req.params.location_id },
            { noInsert: true, noDelete: true, noUpdate: nonModifiable });
          return res.status(200).send(result);
        });
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    }
  },


}

function getNonModifiable(asset) {
  const figure = figureMapping[asset];
  const nonModifiableFigures = figures.filter((f) => f !== figure);
  const nonModifiableAssets = assets.filter(a => a !== asset);
  return [ 'createdByUser', 'updatedByUser' ].concat(nonModifiableFigures, nonModifiableAssets);
}

module.exports = LocationController;
