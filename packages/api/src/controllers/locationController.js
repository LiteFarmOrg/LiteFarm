const LocationModel = require('../models/locationModel');
const baseController = require('./baseController');
const { figureMapping, assets, figures } = require('../middleware/validation/location');
const { transaction, Model } = require('objection');
const LocationController = {
  getLocationsByFarm() {
    return async (req, res, next) => {
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

  deleteLocation() {
    return async (req, res, next) => {
      const { location_id } = req.params;
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(LocationModel, location_id, req, { trx });
        trx.commit();
        res.sendStatus(isDeleted ? 200 : 400);
      } catch (error) {
        trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  },

  createLocation(asset) {
    const nonModifiable = getNonModifiable(asset);
    return async (req, res, next) => {
      const trx = await transaction.start(Model.knex());
      try {
        // OC: the "noInsert" rule will not fail if a relationship is present in the graph.
        // it will just ignore the insert on it. This is just a 2nd layer of protection
        // after the validation middleware.
        const result = await LocationModel.query().context({ user_id: req.user.user_id }).upsertGraph(
          req.body, { noUpdate: true, noDelete: true, noInsert: nonModifiable }, { trx });
        trx.commit();
        res.status(200).send(result);
      } catch (error) {
        trx.rollback();
        console.log(error);
        res.status(400).send({ error });
      }
    }
  },

  updateLocation(asset) {
    const nonModifiable = getNonModifiable(asset);
    return async (req, res, next) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await LocationModel.query().context({ user_id: req.user.user_id }).upsertGraph(
          { ...req.body, location_id: req.params.location_id },
          { noInsert: true, noDelete: true, noUpdate: nonModifiable }, { trx });
        trx.commit();
        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        trx.rollback();
        res.status(400).send({ error });
      }
    }
  },


}

function getNonModifiable(asset) {
  const figure = figureMapping[asset];
  const nonModifiableFigures = figures.filter((f) => f !== figure);
  const nonModifiableAssets = assets.filter(a => a !== asset);
  return ['createdByUser', 'updatedByUser'].concat(nonModifiableFigures, nonModifiableAssets);
}

module.exports = LocationController;
