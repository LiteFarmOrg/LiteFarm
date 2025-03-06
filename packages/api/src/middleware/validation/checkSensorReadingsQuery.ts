/*
 *  Copyright (c) 2025 LiteFarm.org
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

import { Request, Response, NextFunction } from 'express';
import { checkAndTrimString } from '../../util/util.js';
import { isISO8601Format } from '../../util/validation.js';

interface RequestQuery {
  esids?: string;
  startTime?: string;
  endTime?: string;
  truncPeriod?: string;
}

const TRUNC_PERIODS = ['minute', 'hour', 'day'] as const;

type TruncPeriod = (typeof TRUNC_PERIODS)[number];

function isValidTruncPeriod(value: string): value is TruncPeriod {
  return TRUNC_PERIODS.includes(value as TruncPeriod);
}

export default function checkSensorReadingsQuery() {
  return async (
    req: Request<unknown, unknown, unknown, RequestQuery>, // <ReqParams, ResBody, ReqBody, ReqQuery>
    res: Response,
    next: NextFunction,
  ) => {
    const { esids, startTime, endTime, truncPeriod } = req.query;

    if (!checkAndTrimString(esids)) {
      return res.status(400).send('Must provide esid(s)');
    }

    if (startTime && !isISO8601Format(startTime)) {
      return res.status(400).send('Please provide startTime in ISO 8601 format');
    }

    if (endTime && !isISO8601Format(endTime)) {
      return res.status(400).send('Please provide endTime in ISO 8601 format');
    }

    if (truncPeriod && !isValidTruncPeriod(truncPeriod)) {
      return res
        .status(400)
        .send(`Invalid truncPeriod. Allowed values are: ${TRUNC_PERIODS.join(', ')}`);
    }

    next();
  };
}
