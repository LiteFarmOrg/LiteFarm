const LocationModel = require('../models/locationModel');
const baseController = require('./baseController');
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

  async createLocation(req, res, next) {
    const trx = await transaction.start(Model.knex());
    try {
      const result = await LocationModel.query().context({ user_id: req.user.user_id }).upsertGraph(
        req.body, { noUpdate: true }, { trx });
      trx.commit();
      res.status(200).send(result);
    } catch (error) {
      trx.rollback();
      res.status(400).send({ error });
    }
  },

  async updateLocation(req, res, next) {
    const trx = await transaction.start(Model.knex());
    try {
      const result = await LocationModel.query().context({ user_id: req.user.user_id }).upsertGraph(
        { ...req.body, location_id: req.params.location_id }, { noInsert: true }, { trx });
      trx.commit();
      res.status(200).send(result);
    } catch (error) {
      trx.rollback();
      res.status(400).send({ error });
    }
  }

}

module.exports = LocationController;
