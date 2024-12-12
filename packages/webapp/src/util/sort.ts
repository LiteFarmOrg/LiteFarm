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

const hasValue = (value: string | number) => value || value === 0;

export enum orderEnum {
  ASC = 'asc',
  DESC = 'desc',
}

type Comparable<T extends string | number> = {
  [key in T]?: any;
};

export type DescendingComparator<T extends string | number> = (
  a: Comparable<T>,
  b: Comparable<T>,
  orderBy: T,
) => number;

/**
 * Comparator function for descending sorting of an array of objects based on a specific property.
 *
 * @param {Object} a - The first object to compare.
 * @param {Object} b - The second object to compare.
 * @param {string} orderBy - The property by which to compare the objects.
 * @returns {number} - A negative number if a should come before b, a positive number if b should come before a, or 0 if they are equal.
 */
export const descendingComparator: DescendingComparator<string | number> = (a, b, orderBy) => {
  if (!hasValue(b[orderBy]) && hasValue(a[orderBy])) {
    return 1;
  }
  if (!hasValue(a[orderBy]) && hasValue(b[orderBy])) {
    return -1;
  }
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

/**
 * Returns a comparator function for sorting an array of objects in either ascending or descending order based on a specific property.
 *
 * @param {'asc' | 'desc'} order - The sorting order, either 'asc' for ascending or 'desc' for descending.
 * @param {string} orderBy - The property by which to compare the objects.
 * @param {function} customDecendingComparator - The decending comparator to use.
 * @returns {function} - A comparator function for use with the `Array.prototype.sort()` method.
 */
export function getComparator<T extends string | number>(
  order: 'asc' | 'desc',
  orderBy: T,
  customDecendingComparator: DescendingComparator<T> = descendingComparator,
): (a: Comparable<T>, b: Comparable<T>) => number {
  return order === 'desc'
    ? (a: Comparable<T>, b: Comparable<T>) => customDecendingComparator(a, b, orderBy)
    : (a: Comparable<T>, b: Comparable<T>) => -customDecendingComparator(a, b, orderBy);
}

// Ideally, the type of "a" and "b" should be AnimalInventoryItem.
export const animalDescendingComparator: DescendingComparator<string | number> = (
  a,
  b,
  orderBy,
) => {
  if (orderBy !== 'identification') {
    return descendingComparator(a, b, orderBy);
  }

  if (a.name && !b.name) {
    return -1;
  }
  if (b.name && !a.name) {
    return 1;
  }
  if (a.identifier && !b.identifier) {
    return -1;
  }
  if (b.identifier && !a.identifier) {
    return 1;
  }

  return (
    (a.name && b.name && a.name.localeCompare(b.name)) ||
    (a.identifier && b.identifier && a.identifier.localeCompare(b.identifier)) ||
    a.internal_identifier - b.internal_identifier
  );
};
