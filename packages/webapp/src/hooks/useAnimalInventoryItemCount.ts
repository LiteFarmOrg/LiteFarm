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

import { useMemo } from 'react';
import useQueries from './api/useQueries';
import { useGetAnimalBatchesQuery, useGetAnimalsQuery } from '../store/api/apiSlice';
import { Animal, AnimalBatch } from '../store/api/types';

const getCount = (animalOrBatch: (Animal | AnimalBatch)[]) => {
  return animalOrBatch.filter((entity) => !entity.animal_removal_reason_id).length;
};

const useAnimalInventoryItemCount = (): number | undefined => {
  const { data, isLoading, isError } = useQueries([
    { label: 'animals', hook: useGetAnimalsQuery },
    { label: 'batches', hook: useGetAnimalBatchesQuery },
  ]);

  const count = useMemo(() => {
    if (isLoading || isError) {
      return undefined;
    }

    return getCount([...data.animals, ...data.batches]);
  }, [data.animals, data.batches, isLoading, isError]);

  return count;
};

export default useAnimalInventoryItemCount;
