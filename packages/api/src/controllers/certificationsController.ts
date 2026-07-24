/*
 *  Copyright 2026 LiteFarm.org
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

import { Response } from 'express';
import { transaction, Model } from 'objection';
import CertificationModel from '../models/certificationModel.js';
import {
  CertificationBody,
  CertificationParams,
} from '../middleware/validation/checkCertification.js';
import { handleObjectionError } from '../util/errorCodes.js';
import { notifyFarmMarketDirectoryPartners } from '../services/notifyMarketDirectoryPartners.js';
import { HttpError, LiteFarmRequest } from '../types.js';

const MUTABLE_FIELDS = [
  'system_type_id',
  'certifier_id',
  'requested_system_type',
  'other_certifier',
  'is_active',
  'certification_type',
  'certificate_number',
  'certificate_member_id',
  'issue_date',
  'valid_until',
] as const;

const certificationsController = {
  getCertifications() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        const { farm_id } = req.headers;

        /* @ts-expect-error known issue with models */
        const certifications = await CertificationModel.query()
          .whereNotDeleted()
          .where({ farm_id })
          .orderBy('created_at');

        return res.status(200).json(certifications);
      } catch (error: unknown) {
        console.error(error);
        const err = error as HttpError;
        const status = err.status || err.code || 500;
        return res.status(status).json({ error: err.message || err });
      }
    };
  },

  addCertification() {
    return async (
      req: LiteFarmRequest<unknown, unknown, unknown, CertificationBody>,
      res: Response,
    ) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { farm_id } = req.headers;
        const { user_id } = req.auth!;
        // BaseModel hooks overwrite the audit fields; id and deleted are the ones to guard here
        const { id: _id, deleted: _deleted, ...data } = req.body as Record<string, unknown>;

        /* @ts-expect-error known issue with models */
        const certification = await CertificationModel.query(trx)
          .context({ user_id })
          .insert({ ...data, farm_id })
          .returning('*');

        await trx.commit();
        res.status(201).json(certification);
        // Fire-and-forget after the response — partners see certifications in DFC output
        notifyFarmMarketDirectoryPartners(farm_id!);
        return;
      } catch (error: unknown) {
        return await handleObjectionError(error as Error, res, trx);
      }
    };
  },

  updateCertification() {
    return async (
      req: LiteFarmRequest<unknown, CertificationParams, unknown, CertificationBody>,
      res: Response,
    ) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { id } = req.params;
        const { user_id } = req.auth!;

        /* @ts-expect-error known issue with models */
        const existing = await CertificationModel.query(trx).findById(id).whereNotDeleted();
        if (!existing) {
          await trx.rollback();
          return res.status(404).json({ error: 'Certification not found' });
        }

        // PUT semantics: replace all mutable fields; absent fields are cleared
        const fullData = Object.fromEntries(
          MUTABLE_FIELDS.map((field) => [field, req.body[field] ?? null]),
        );

        /* @ts-expect-error known issue with models */
        const updated = await CertificationModel.query(trx)
          .context({ user_id })
          .patchAndFetchById(id, fullData);

        await trx.commit();
        res.status(200).json(updated);
        notifyFarmMarketDirectoryPartners(req.headers.farm_id!);
        return;
      } catch (error: unknown) {
        return await handleObjectionError(error as Error, res, trx);
      }
    };
  },

  deleteCertification() {
    return async (
      req: LiteFarmRequest<unknown, CertificationParams, unknown, unknown>,
      res: Response,
    ) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { id } = req.params;
        const { user_id } = req.auth!;

        /* @ts-expect-error known issue with models */
        const existing = await CertificationModel.query(trx).findById(id).whereNotDeleted();
        if (!existing) {
          await trx.rollback();
          return res.status(404).json({ error: 'Certification not found' });
        }

        /* @ts-expect-error known issue with models */
        await CertificationModel.query(trx).context({ user_id }).deleteById(id);

        await trx.commit();
        res.sendStatus(204);
        notifyFarmMarketDirectoryPartners(req.headers.farm_id!);
        return;
      } catch (error: unknown) {
        return await handleObjectionError(error as Error, res, trx);
      }
    };
  },
};

export default certificationsController;
