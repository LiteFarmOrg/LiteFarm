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

import { NextFunction, Response } from 'express';
import knex from '../../util/knex.js';
import { HttpError, LiteFarmRequest } from '../../types.js';

export const PGS_TRANSLATION_KEY = 'PGS';

export interface CertificationBody {
  system_type_id?: number | null;
  certifier_id?: number | null;
  requested_system_type?: string | null;
  other_certifier?: string | null;
  is_active?: boolean;
  certification_type?: string | null;
  certificate_number?: string | null;
  certificate_member_id?: string | null;
  issue_date?: string | null;
  valid_until?: string | null;
}

export interface CertificationParams {
  id: string;
}

export function checkCertification() {
  return async (
    req: LiteFarmRequest<unknown, CertificationParams, unknown, CertificationBody>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const {
        system_type_id,
        certifier_id,
        other_certifier,
        is_active,
        certification_type,
        certificate_number,
        certificate_member_id,
        issue_date,
        valid_until,
      } = req.body;

      const systemType =
        system_type_id != null
          ? await knex('certification_system_type').where({ id: system_type_id }).first()
          : undefined;
      if (!systemType) {
        return res.status(400).json({ error: 'A valid system_type_id is required' });
      }
      if (typeof is_active !== 'boolean') {
        return res.status(400).json({ error: 'is_active is required' });
      }
      if (!certification_type) {
        return res.status(400).json({ error: 'certification_type is required' });
      }

      const hasCertifierId = certifier_id != null;
      const hasOtherCertifier = !!other_certifier?.trim();
      if (hasCertifierId === hasOtherCertifier) {
        return res
          .status(400)
          .json({ error: 'Exactly one of certifier_id and other_certifier is required' });
      }

      if (hasCertifierId) {
        const certifier = await knex('certifiers').where({ certifier_id }).first();
        if (!certifier || certifier.system_type_id !== system_type_id) {
          return res
            .status(400)
            .json({ error: 'certifier_id does not match the given system_type_id' });
        }
      }

      if (is_active) {
        const isPgs = systemType.translation_key === PGS_TRANSLATION_KEY;
        if (isPgs) {
          if (!certificate_member_id) {
            return res
              .status(400)
              .json({ error: 'certificate_member_id is required for an active certification' });
          }
          if (certificate_number) {
            return res
              .status(400)
              .json({ error: 'certificate_number is not accepted for this system type' });
          }
        } else {
          if (!certificate_number) {
            return res
              .status(400)
              .json({ error: 'certificate_number is required for an active certification' });
          }
          if (certificate_member_id) {
            return res
              .status(400)
              .json({ error: 'certificate_member_id is not accepted for this system type' });
          }
        }
        if (!issue_date || !valid_until) {
          return res
            .status(400)
            .json({ error: 'issue_date and valid_until are required for an active certification' });
        }
      }

      next();
    } catch (error: unknown) {
      console.error(error);

      const err = error as HttpError;
      const status = err.status || err.code || 500;
      return res.status(status).json({ error: err.message || err });
    }
  };
}
