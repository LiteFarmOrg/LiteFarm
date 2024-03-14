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

import { Dispatch, SetStateAction, useState } from 'react';
import {
  useRemoveAnimalBatchesMutation,
  useRemoveAnimalsMutation,
} from '../../../store/api/apiSlice';
import { toLocalISOString } from '../../../util/moment';
import { parseInventoryId } from '../../../util/animal';
import { FormFields } from '../../../components/Animals/RemoveAnimalsModal';

const useAnimalOrBatchRemoval = (
  selectedInventoryIds: string[],
  setSelectedInventoryIds: Dispatch<SetStateAction<string[]>>,
) => {
  const [removeAnimals] = useRemoveAnimalsMutation();
  const [removeBatches] = useRemoveAnimalBatchesMutation();
  const [removalModalOpen, setRemovalModalOpen] = useState(false);

  const handleAnimalOrBatchRemoval = (formData: FormFields) => {
    const timestampedDate = toLocalISOString(formData.date);

    const animalRemovalArray = [];
    const animalBatchRemovalArray = [];

    for (const id of selectedInventoryIds) {
      const { kind, id: entity_id } = parseInventoryId(id);
      if (kind === 'ANIMAL') {
        animalRemovalArray.push({
          id: entity_id,
          animal_removal_reason_id: Number(formData.reason), // mobile UI uses a native radio input & will always generate a string
          removal_explanation: formData.explanation,
          removal_date: timestampedDate,
        });
      } else if (kind === 'BATCH') {
        animalBatchRemovalArray.push({
          id: entity_id,
          animal_removal_reason_id: Number(formData.reason),
          removal_explanation: formData.explanation,
          removal_date: timestampedDate,
        });
      }
    }

    animalRemovalArray.length && removeAnimals(animalRemovalArray);
    animalBatchRemovalArray.length && removeBatches(animalBatchRemovalArray);

    setRemovalModalOpen(false);
    setSelectedInventoryIds([]);
  };

  return { handleAnimalOrBatchRemoval, removalModalOpen, setRemovalModalOpen };
};

export default useAnimalOrBatchRemoval;
