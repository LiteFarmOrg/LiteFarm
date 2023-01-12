/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import baseController from '../controllers/baseController.js';
import NominationModel from '../models/nominationModel.js';
// import NominationTypeModel from '../models/nominationTypeModel.js';
import NominationStatusModel from '../models/nominationStatusModel.js';
import NominationWorkflowModel from '../models/nominationWorkflowModel.js';
import objection from 'objection';
const { transaction, Model, UniqueViolationError } = objection;

/**
 * This controller should be used to manipulate the set of nomination models
 */
const nominationController = {
  /**
   * This will add a new nomination to the table based on nomination type in body.
   * @param {string} initialStatus This is the initial workflow status for the nomination status log.
   * @returns The created nomination and status row.
   */
  addNomination(initialStatus) {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.body;
        //Get workflow id
        //TODO: Hopefully this gets changed/removed with workflow ranking
        const { workflow_id } = await NominationWorkflowModel.getWorkflowIdByStatusAndTypeGroup(
          initialStatus,
          data.nomination_type,
          trx,
        );
        data.workflow_id = workflow_id;
        // Add nomination
        const nomination = await baseController.postWithResponse(NominationModel, data, req, {
          trx,
        });
        data.nomination_id = nomination.nomination_id;
        // Add status change entry
        const status = await baseController.postWithResponse(NominationStatusModel, data, req, {
          trx,
        });
        const result = { nomination, status };
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        console.log(error);
        let violationError = false;
        if (error instanceof UniqueViolationError) {
          violationError = true;
          await trx.rollback();
          res.status(400).json({
            error,
            violationError,
          });
        } else {
          await trx.rollback();
          res.status(400).json({
            error,
            violationError,
          });
        }
      }
    };
  },

  /**
   * This will add a new nomination to the table based from another controller using its transaction.
   * @param {string} initialStatus This is the initial workflow status for the nomination status log.
   * @returns The created nomination and status row.
   */
  async addNominationFromController(nominationType, initialStatus, req, trx) {
    const data = req.body;
    data.nomination_type = nominationType;
    //Get workflow id
    //TODO: Hopefully this gets changed/removed with workflow ranking
    const { workflow_id } = await NominationWorkflowModel.getWorkflowIdByStatusAndTypeGroup(
      initialStatus,
      nominationType,
      trx,
    );
    data.workflow_id = workflow_id;
    // Add nomination
    const nomination = await baseController.postWithResponse(NominationModel, data, req, {
      trx,
    });
    data.nomination_id = nomination.nomination_id;
    // Add status change entry
    const status = await baseController.postWithResponse(NominationStatusModel, data, req, {
      trx,
    });
    const result = { nomination, status };
    return result;
  },

  /**
   * This updates a single nomination based on a nomination id and nomination type in body.
   * @returns The updated nomination row.
   */
  updateNomination() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.body;
        const params = req.params;
        const nomination = await baseController.put(
          NominationModel,
          params.nomination_id,
          data,
          req,
          {
            trx,
          },
        );
        const result = { nomination };
        await trx.commit(result);
        res.status(201).send(result);
      } catch (error) {
        console.log(error);
        let violationError = false;
        if (error instanceof UniqueViolationError) {
          violationError = true;
          await trx.rollback();
          res.status(400).json({
            error,
            violationError,
          });
        }
        //handle more exceptions
        else {
          await trx.rollback();
          res.status(400).json({
            error,
            violationError,
          });
        }
      }
    };
  },

  /**
   * Soft deletes a nomination based on nomination id
   * @returns Boolean success
   */
  deleteNomination() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const params = req.params;
        const success = await baseController.delete(NominationModel, params.nomination_id, req, {
          trx,
        });
        await trx.commit();
        res.status(201).send({ success });
      } catch (error) {
        console.log(error);
        let violationError = false;
        if (error instanceof UniqueViolationError) {
          violationError = true;
          await trx.rollback();
          res.status(400).json({
            error,
            violationError,
          });
        }
        //handle more exceptions
        else {
          await trx.rollback();
          res.status(400).json({
            error,
            violationError,
          });
        }
      }
    };
  },
};

export default nominationController;
