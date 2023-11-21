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

import { useState, useMemo } from 'react';

/**
 * A custom hook to filter an array of items based on a string.
 *
 * This hook can be used with either the search string controlled in state, or set elsewhere and passed in. If a search string is not provided, internal state will be used.
 *
 * @param {Array} items - The items to filter.
 * @param {function} getSearchableString - Function that takes in a array item and constructs the string to search on (e.g. concatenates the properties of interest)
 * @param {string} providedFilter - the search string -- provide if the search string state is handled outside the component calling the hook
 * @returns {Object} - An object containing the current filter, a setter for the filter, and the filtered items.
 */

export const useSearchFilter = (
  items = [],
  getSearchableString = () => {},
  providedFilter = '',
) => {
  const [internalFilter, setInternalFilter] = useState('');

  const searchString = providedFilter || internalFilter;

  const filteredItems = useMemo(() => {
    if (!searchString) return items;

    return items.filter((item) => {
      return check(getSearchableString(item), searchString);
    });
  }, [items, searchString]);

  return [filteredItems, internalFilter, setInternalFilter];
};

/**
 * Checks if a string matches the given search filter.
 *
 * First performs a case-insensitive check on the raw string, then on its normalized version.
 *
 * @param {string} string - The string to be searched.
 * @param {string} filter - The search filter to check against.
 * @returns {boolean} - Returns true if the string matches the filter; false otherwise.
 */

const check = (string, filter) => {
  return (
    string?.toLowerCase().includes(filter.toLowerCase()) ||
    string
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .includes(filter.toLowerCase())
  );
};

export default useSearchFilter;
