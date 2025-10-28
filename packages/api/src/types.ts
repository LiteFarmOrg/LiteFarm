/*
 *  Copyright 2025 LiteFarm.org
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

import { NextFunction, Request, Response } from 'express';

export interface HttpError extends Error {
  status?: number;
  code?: number; // LF custom error
}

// TODO: Remove farm_id conditional and cast this in a checkScope() that takes the function and casts this to req
export interface LiteFarmRequest<
  QueryParams = unknown,
  RouteParams = unknown,
  ResBody = unknown,
  ReqBody = unknown,
> extends Request<RouteParams, ResBody, ReqBody, QueryParams> {
  headers: Request['headers'] & {
    farm_id?: string;
  };
}

// Can be used to cast after checkScope() succeeds
export type LiteFarmHandler<QueryParams = unknown> = (
  req: LiteFarmRequest<QueryParams>,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;
