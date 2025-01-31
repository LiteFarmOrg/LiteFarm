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

// Utils
// Checks an array has exactly one truthy value
export const notExactlyOneValue = (values) => {
  const nonNullValues = values.filter(Boolean);
  return !(nonNullValues.length === 1);
};

// Checks an array of object keys against object -- at least one of the properties is defined
export const someExists = (keys, object) => {
  return keys.some((key) => key in object);
};

// Checks an array for at least one truthy value
export const someTruthy = (values) => values.some((value) => !!value);

// Sets falsy values to null for editing values that may have values for exclusive constraints
export const setFalsyValuesToNull = (array, obj) => {
  for (const val of array) {
    obj[val] ??= null;
  }
};
