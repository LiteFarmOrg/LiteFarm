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

const useMutations = (namedMutations) => {
  const results = namedMutations.map((mutation) => mutation.hook());
  const data = results.map((result) => result[1]);

  const isError = data.some((result) => result.isError);
  const isLoading = data.some((result) => result.isLoading) && !isError;
  const isSuccess = data.every((result) => result.isSuccess);

  const mutations = namedMutations.reduce(
    (dataObj, mutation, index) => ({
      ...dataObj,
      [mutation.label]: {
        trigger: results[index][0],
        lifecycle: results[index][1],
      },
    }),
    {},
  );

  return {
    mutations,
    isLoading,
    isError,
    isSuccess,
  };
};

export default useMutations;
