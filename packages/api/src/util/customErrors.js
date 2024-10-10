import { oneTruthy, hasMultipleValues } from './middleware.js';

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
  if (oneTruthy(values) && hasMultipleValues(values)) {
    throw customError(`Exactly one of ${errorText} must be sent`);
  }
};

// This checks if the record belongs to the farm -- hasFarmAccess does not handle collections (bulk endpoints)
export const checkRecordBelongsToFarm = async (record, farm_id, errorText) => {
  if (record && record.farm_id !== farm_id) {
    throw customError(`Forbidden ${errorText} does not belong to this farm`, 403);
  }
};
