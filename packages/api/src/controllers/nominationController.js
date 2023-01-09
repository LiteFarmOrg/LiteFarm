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
import { transaction, Model, UniqueViolationError } from 'objection';

const nominationController = {
  addNominationWithModel(nominationType) {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.body;
        const nominationId = await NominationModel.createNomination(data.user_id, nominationType);
        const workflowGroup = await NominationTypeModel.getWorkflowGroupByType(nominationType);
        const workflowId = await NominationWorkflowModel.getWorkflowIdByNameAndGroup(
          'NOMINATED',
          workflowGroup,
        );
        const statusId = await NominationStatusModel.createNominationStatus(
          data.user_id,
          nominationId,
          workflowId,
        );
        const result = `A nomination for ${nominationType} type has been created with nomination id: ${nominationId} and status id: ${statusId}`;
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

  addNominationWithBaseController(nominationType) {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.body;
        const nomination = await baseController.postWithResponse(NominationModel, data, req, {
          trx,
        });
        const workflowGroup = await NominationTypeModel.getWorkflowGroupByType(nominationType);
        const workflowId = await NominationWorkflowModel.getWorkflowIdByNameAndGroup(
          'NOMINATED',
          workflowGroup,
        );
        data.nomination_id = nomination.nomination_id;
        data.workflow_id = workflowId;
        const status = await baseController.postWithResponse(NominationStatusModel, data, req, {
          trx,
        });
        const result = `A nomination for ${nominationType} type has been created with nomination id: ${nomination.nomination_id} and status id: ${status.statusId}`;
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
};

export default nominationController;
