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

const useQueries = (queries) => {
  const result = queries.map((query) => query.hook(query.params));

  const data = queries.reduce(
    (dataObj, query, index) => ({
      ...dataObj,
      [query.label]: result[index].data,
    }),
    {},
  );
  const isError = result.some((result) => !!result.error);
  const isLoading = result.some((result) => result.isLoading) && !isError;

  return {
    data,
    isLoading,
    isError,
  };
};

export default useQueries;
