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
import NominationTypeModel from '../models/nominationTypeModel.js';
import NominationStatusModel from '../models/nominationStatusModel.js';
import NominationWorkflowModel from '../models/nominationWorkflowModel.js';
import objection from 'objection';
const { transaction, Model, UniqueViolationError } = objection;

const nominationController = {
  addNomination(nominationType, initialStatus) {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.body;
        data.nomination_type = nominationType;
        // Add nomination
        const { nomination_id, nomination_type } = await baseController.postWithResponse(
          NominationModel,
          data,
          req,
          {
            trx,
          },
        );
        data.nomination_id = nomination_id;
        // Find workflow group based on type
        const { workflow_group } = await NominationTypeModel.query(trx).findById(nomination_type);
        //Get workflow id
        const { id: workflow_id } = await NominationWorkflowModel.getWorkflowIdByNameAndGroup(
          initialStatus,
          workflow_group,
          trx,
        );
        data.workflow_id = workflow_id;
        // Add status change entry
        const { status_id } = await baseController.postWithResponse(
          NominationStatusModel,
          data,
          req,
          {
            trx,
          },
        );
        const result = { nomination_id, status_id };
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

  updateNomination() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.body;
        const { nomination_type } = await NominationModel.query(trx).findById(data.nomination_id);
        data.nomination_type = nomination_type;
        const nomination = await baseController.put(
          NominationModel,
          data.nomination_id,
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

  deleteNomination() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.params;
        const success = await baseController.delete(NominationModel, data.nomination_id, req, {
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
