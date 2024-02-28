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

export enum orderEnum {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Comparator function for descending sorting of an array of objects based on a specific property.
 *
 * @param {Object} a - The first object to compare.
 * @param {Object} b - The second object to compare.
 * @param {string} orderBy - The property by which to compare the objects.
 * @returns {number} - A negative number if a should come before b, a positive number if b should come before a, or 0 if they are equal.
 */
function descendingComparator(a: any, b: any, orderBy: string) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

/**
 * Returns a comparator function for sorting an array of objects in either ascending or descending order based on a specific property.
 *
 * @param {'asc' | 'desc'} order - The sorting order, either 'asc' for ascending or 'desc' for descending.
 * @param {string} orderBy - The property by which to compare the objects.
 * @returns {function} - A comparator function for use with the `Array.prototype.sort()` method.
 */
export function getComparator(order: orderEnum, orderBy: string) {
  return order === 'desc'
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}
