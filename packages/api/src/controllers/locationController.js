import LocationModel from '../models/locationModel.js';
import baseController from './baseController.js';
import { assets, figures, getNonModifiable } from '../middleware/validation/location.js';

const LocationController = {
  getLocationsByFarm() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      const locations = await LocationModel.query().where({ 'location.farm_id': farm_id })
        .withGraphJoined(`[
          figure.[area, line, point], 
          gate, water_valve, field, garden, buffer_zone, watercourse, fence, 
          ceremonial_area, residence, surface_water, natural_area,
          greenhouse, barn, farm_site_boundary, sensor
        ]`);
      return res.status(200).send(locations);
    };
  },

  deleteLocation() {
    return async (req, res, next) => {
      const { location_id } = req.params;
      try {
        const isDeleted = await baseController.delete(LocationModel, location_id, req);
        return res.sendStatus(isDeleted ? 200 : 400);
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  // TODO: to deprecate
  checkDeleteLocation() {
    return async (req, res, next) => {
      return res.sendStatus(200);
    };
  },

  createLocation(asset) {
    const nonModifiable = getNonModifiable(asset);
    return async (req, res, next) => {
      try {
        // OC: the "noInsert" rule will not fail if a relationship is present in the graph.
        // it will just ignore the insert on it. This is just a 2nd layer of protection
        // after the validation middleware.
        const result = await LocationModel.transaction(async (trx) => {
          return await LocationModel.query(trx)
            .context({ user_id: req.user.user_id })
            .upsertGraph(req.body, { noUpdate: true, noDelete: true, noInsert: nonModifiable });
        });
        return res.status(200).send(result);
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    };
  },

  updateLocation(asset) {
    const nonModifiable = getNonModifiable(asset);
    return async (req, res, next) => {
      try {
        const result = await LocationModel.transaction(async (trx) => {
          return await LocationModel.query(trx)
            .context({ user_id: req.user.user_id })
            .upsertGraph(
              { ...req.body, location_id: req.params.location_id },
              {
                noInsert: [...figures, ...assets, 'figure'],
                noDelete: true,
                noUpdate: nonModifiable,
              },
            );
        });
        return res.status(200).send(result);
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    };
  },
};

export default LocationController;
