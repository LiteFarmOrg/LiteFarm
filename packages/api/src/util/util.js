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

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a UUID map based on the given array and property.
 *
 * @param {Array} arr - The array used to create the UUID map from.
 * @param {string} property - The property of each object to use as the key in the UUID map.
 * @returns {Object} - The UUID map with property values as keys and UUIDs as values.
 */
export const getUUIDMap = (arr, property) => {
  const uuidMap = {};
  arr.forEach((item) => {
    uuidMap[item[property]] = uuidv4();
  });
  return uuidMap;
};

/**
 * Converts an array of date strings into an array of JavaScript Date objects and returns them in sorted order.
 *
 * @param {string[]} dates - An array of date strings to be converted and sorted.
 * @returns {Date[]} - An array of JavaScript Date objects sorted in ascending order.
 */
export const getSortedDates = (dates) => {
  const jsDates = dates.map((date) => new Date(date));
  return jsDates.sort((date1, date2) => date1 - date2);
};

/**
 * Checks if the input is a string and not just white space.
 * Returns a trimmed version of the input if it's a valid string, or null
 *
 * @param {string} input - The input string to validate and trim.
 * @return {string | null} - The trimmed string if valid, otherwise null.
 */
export const checkAndTrimString = (input) => {
  if (typeof input !== 'string' || !input.trim()) {
    return null;
  }
  return input.trim();
};

/**
 * Format translation key
 * @param {String} key
 * @returns {String} - Formatted key
 */
export const formatTranslationKey = (key) => {
  return key.toUpperCase().trim().replaceAll(' ', '_');
};

export const upperCaseTrim = (a) => {
  return a.toUpperCase().trim();
};

/**
 * Check for duplicate or matching strings - (same as frontend util)
 * TODO: consider localeCompare() or not caring about case sensitivity
 * @param {String} key
 * @returns {String} - Formatted key
 */
export const compareUpperCaseTrim = (a, b) => {
  return upperCaseTrim(a) === upperCaseTrim(b);
};
