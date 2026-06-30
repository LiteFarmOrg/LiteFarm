/*
 *  Copyright 2024 LiteFarm.org
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

import { notExactlyOneValue } from './middleware.js';

interface LiteFarmError extends Error {
  type: 'LiteFarmCustom';
  code: number;
  body?: Record<string, unknown>;
}

// Extends the error class
export class LiteFarmCustomError extends Error implements LiteFarmError {
  type = 'LiteFarmCustom' as const;
  code: number;
  body?: Record<string, unknown>;

  constructor(message: string, code: number, body?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.body = body;
  }
}

// Factory function
export const customError = (
  message: string,
  code: number = 400,
  body?: Record<string, unknown>,
): LiteFarmCustomError => {
  return new LiteFarmCustomError(message, code, body);
};

export const checkIsArray = (someValue: unknown, errorText = '') => {
  if (!Array.isArray(someValue)) {
    throw customError(`${errorText} should be an array`);
  }
};

export const checkIdIsNumber = (id: unknown) => {
  if (!id || isNaN(Number(id))) {
    throw customError('Must send valid ids');
  }
};

export const checkExactlyOneIsProvided = (values: unknown[], errorText: string) => {
  if (notExactlyOneValue(values)) {
    throw customError(`Exactly one of ${errorText} must be sent`);
  }
};

// This checks if the record belongs to the farm -- hasFarmAccess does not handle collections (bulk endpoints)
export const checkRecordBelongsToFarm = async (
  record: Record<string, unknown>,
  farm_id: string,
  errorText: string,
) => {
  if (record && record.farm_id !== farm_id) {
    throw customError(`Forbidden ${errorText} does not belong to this farm`, 403);
  }
};
