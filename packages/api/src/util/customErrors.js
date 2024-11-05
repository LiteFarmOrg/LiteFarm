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

// Constructs a reusable error object
export const customError = (message, code = 400, body = undefined) => {
  const error = new Error(message);
  error.code = code;
  error.body = body;
  error.type = 'LiteFarmCustom';
  return error;
};

export const checkIsArray = (someValue, errorText = '') => {
  if (!Array.isArray(someValue)) {
    throw customError(`${errorText} should be an array`);
  }
};

export const checkIdIsNumber = (id) => {
  if (!id || isNaN(Number(id))) {
    throw customError('Must send valid ids');
  }
};

export const checkExactlyOneIsProvided = (values, errorText) => {
  if (notExactlyOneValue(values)) {
    throw customError(`Exactly one of ${errorText} must be sent`);
  }
};

// This checks if the record belongs to the farm -- hasFarmAccess does not handle collections (bulk endpoints)
export const checkRecordBelongsToFarm = async (record, farm_id, errorText) => {
  if (record && record.farm_id !== farm_id) {
    throw customError(`Forbidden ${errorText} does not belong to this farm`, 403);
  }
};
