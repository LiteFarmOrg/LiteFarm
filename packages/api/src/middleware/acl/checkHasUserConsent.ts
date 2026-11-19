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
import { LiteFarmRequest } from '../../types.js';
import UserConsentModel from '../../models/userConsentModel.js';

export default function checkHasUserConsent() {
  return async (req: LiteFarmRequest, res: Response, next: NextFunction) => {
    const { user_id } = req.auth!;

    try {
      const consent = await UserConsentModel.getConsent(user_id);

      if (!consent) {
        return res.status(403).json({ error: 'User has not provided consent' });
      }

      next();
    } catch (error: unknown) {
      console.error(error);
      const err = error as Error;
      return res.status(500).json({ error: err.message });
    }
  };
}
