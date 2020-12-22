/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fertilizerController.js) is part of LiteFarm.
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

const baseController = require('../controllers/baseController');
const supportTicketModel = require('../models/supportTicketModel');

class supportTicketController extends baseController {
  // Disabled
  static getSupportTicketsByFarmId() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const result = await supportTicketModel.query().whereNotDeleted().where({ farm_id });
        if (!result) {
          res.sendStatus(404);
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        //handle more exceptions
        console.error(error);
        res.status(400).json({
          error,
        });
      }
    };
  }

  static addSupportTicket() {
    return async (req, res) => {
      try {
        const user_id = req.user.user_id;
        const result = await supportTicketModel.query().context({ user_id }).insert(req.body).returning('*');
        res.status(201).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  }

  // Disabled
  static patchStatus() {
    return async (req, res) => {
      const support_ticket_id = req.params.support_ticket_id;
      try {
        const user_id = req.user.user_id;
        const status = req.body.status;
        const result = await supportTicketModel.query().context({ user_id }).findById(support_ticket_id).patch({ status });
        res.sendStatus(200);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  }
}

module.exports = supportTicketController;
