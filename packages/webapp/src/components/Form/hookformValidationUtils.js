/*
 *  Copyright 2023 LiteFarm.org
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

// This file contains validation functions for use with react-hook-forms input validator

import i18n from '../../locales/i18n';

export const hookFormMaxValidation = (max = 9999) => ({
  value: max,
  message: i18n.t('common:MAX_ERROR', { value: max }),
});
export const hookFormMinValidation = (min) => ({
  value: min,
  message: i18n.t('common:MIN_ERROR', { value: min }),
});
export const hookFormMaxLengthValidation = (length = 60) => ({
  value: length,
  message: i18n.t('common:WORD_LIMIT_ERROR', { value: length }),
});
export const hookFormMaxCharsValidation = (max = 9999) => ({
  value: max,
  message: i18n.t('common:CHAR_LIMIT_ERROR', { value: max }),
});

/**
 * Validates if a value is unique within an array of objects based on a specified property.
 *
 * @param {Array<Object>} objArr - The array of objects to search for duplicates in.
 * @param {string} property - The property within each object to check for uniqueness.
 * @param {string} message - The error message to return if the value is not unique.
 * @returns {(value: any) => string|boolean} A validation function that takes a value to validate and returns
 * either the error message (if not unique) or `true` (if unique).
 */
export const hookFormUniquePropertyValidation = (objArr, property, message) => {
  return (value) => {
    const alreadyExists = objArr.some((item) => {
      return item[property] === value;
    });
    if (alreadyExists) {
      return message;
    }
    return true;
  };
};
