/*
 *  Copyright 2023, 2025 LiteFarm.org
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
import { TFunction } from 'react-i18next';

export const hookFormMaxValidation = (max: number = 9999, message: string = '') => ({
  value: max,
  message: message || i18n.t('common:MAX_ERROR', { value: max + 1 }),
});

export const hookFormMinValidation = (min: number) => ({
  value: min,
  message: i18n.t('common:MIN_ERROR', { value: min - 1 }),
});

export const hookFormMaxLengthValidation = (length: number = 60) => ({
  value: length,
  message: i18n.t('common:WORD_LIMIT_ERROR', { value: length }),
});

export const hookFormMaxCharsValidation = (max: number = 9999) => ({
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
export const hookFormUniquePropertyValidation = (
  objArr: Array<{ [key: string]: any }>,
  property: string,
  message: string,
) => {
  return (value: any) => {
    const alreadyExists = objArr.some((item) => {
      return item[property] === value;
    });
    if (alreadyExists) {
      return message;
    }
    return true;
  };
};

/**
 * Validates if a value is unique within an array of objects based on a specified property.
 * Returns different messages depending on the boolean status of a specified property in the found object.
 *
 * @param {Array<Object>} objArr - The array of objects to search for duplicates in.
 * @param {string} property - The property within each object to check for uniqueness.
 * @param {string} [status='deleted'] - The status property to check in the object. Defaults to 'deleted'.
 * @param {string} messageStatusTrue - The error message to return if the status property is true.
 * @param {string} messageStatusFalse - The error message to return if the status property is false or the object is not found.
 * @returns {(value: any) => string|boolean} A validation function that takes a value to validate and returns
 * either an error message or `true` if the value is unique
 */
export const hookFormUniquePropertyWithStatusValidation = ({
  objArr,
  property,
  status = 'deleted',
  messageStatusTrue,
  messageStatusFalse,
}: {
  objArr: Array<{ [key: string]: any }>;
  property: string;
  status?: string;
  messageStatusTrue: string;
  messageStatusFalse: string;
}) => {
  return (value: any) => {
    const foundItem = objArr.find((item) => item[property] === value);

    if (foundItem) {
      if (foundItem[status]) {
        return messageStatusTrue;
      }
      return messageStatusFalse;
    }

    return true;
  };
};

/**
 * Validates whether the length of the selected option's label exceeds the specified maximum.
 * Returns an error message if the length is greater than the allowed limit; otherwise, returns true.
 *
 * @param {string} selectedOption - The option whose label length is being validated.
 * @param {number} length - The maximum allowed length for the label.
 * @returns {string | boolean} A validation function that checks the label's length
 * and returns either an error message or `true` if the validation passes.
 */
const hookFormSelectOptionMaxLength = (selectedOption: { label: string }, length: number = 255) => {
  const t: TFunction = i18n.t;
  return selectedOption?.label.length <= length || t('common:CHAR_LIMIT_ERROR', { value: length });
};

export const validateOptionLength = (value: { label: string }) => {
  return hookFormSelectOptionMaxLength(value);
};
