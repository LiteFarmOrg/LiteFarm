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

import { AddAnimalsSummaryCard } from '../../../../components/Animals/AddAnimalsSummaryCard';
import { ANIMALS_INVENTORY_URL } from '../../../../util/siteMapConstants';
import {
  useGetAnimalSexesQuery,
  useGetCustomAnimalBreedsQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetDefaultAnimalTypesQuery,
} from '../../../../store/api/apiSlice';
import useQueries from '../../../../hooks/api/useQueries';
import { formatDBAnimalsToSummary, formatDBBatchesToSummary } from '../../AddAnimals/utils';
import { Animal, AnimalBatch } from '../../../../store/api/types';
import { useNavigate } from 'react-router-dom-v5-compat';

type AddAnimalSummaryProps = {
  formResultData: { animals: Animal[]; batches: AnimalBatch[] };
};

const AddAnimalSummary = ({ formResultData }: AddAnimalSummaryProps) => {
  let navigate = useNavigate();
  const { data: config, isLoading } = useQueries([
    { label: 'defaultTypes', hook: useGetDefaultAnimalTypesQuery },
    { label: 'customTypes', hook: useGetCustomAnimalTypesQuery },
    { label: 'defaultBreeds', hook: useGetDefaultAnimalBreedsQuery },
    { label: 'customBreeds', hook: useGetCustomAnimalBreedsQuery },
    { label: 'sexes', hook: useGetAnimalSexesQuery },
  ]);

  return (
    <AddAnimalsSummaryCard
      animalsInfo={isLoading ? [] : formatDBAnimalsToSummary(formResultData.animals, config)}
      batchInfo={isLoading ? [] : formatDBBatchesToSummary(formResultData.batches, config)}
      onContinue={() => navigate(ANIMALS_INVENTORY_URL)}
    />
  );
};

export default AddAnimalSummary;
