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

import { Request } from 'express';
import { Farm, Point, Role, Task, TaskType, User } from './models/types.js';

export interface HttpError extends Error {
  status?: number;
  code?: number; // LF custom error
}

/**
 * For use with unchecked requests
 *
 * All possible shapes of a litefarm 'req' object
 */
export interface LiteFarmRequest<QueryParams = unknown>
  extends Request<unknown, unknown, unknown, QueryParams> {
  auth?: {
    user_id?: User['user_id'];
    farm_id?: Farm['farm_id'];
    sub?: User['user_id'];
    email?: User['email'];
    given_name?: User['first_name'];
    family_name?: User['last_name'];
    first_name?: User['first_name'];
    language_preference?: string;
  };
  headers: Request['headers'] & {
    user_id?: User['user_id'];
    farm_id?: Farm['farm_id'];
  };
  role?: Role['role_id'];
  isMinimized?: boolean;
  isTextDocument?: boolean;
  isNotMinimized?: boolean;
  field?: { fieldId?: string | number; point?: Point };
  file?: unknown;
  checkTaskStatus?: {
    complete_date?: Task['complete_date'];
    abandon_date?: Task['abandon_date'];
    assignee_user_id?: Task['assignee_user_id'];
    task_translation_key?: TaskType['task_translation_key'];
  };
}

/**
 * For use after checkScope() middleware.
 *
 * DO NOT add more required props unless it is auth related, make a new type
 */

export interface ScopeCheckedLiteFarmRequest<ReqQuery = unknown> extends LiteFarmRequest<ReqQuery> {
  auth: {
    user_id: User['user_id'];
  };
  headers: Request['headers'] & {
    farm_id: string;
  };
}
