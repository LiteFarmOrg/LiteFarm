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

import { Dispatch, SetStateAction, useState, useCallback, useMemo } from 'react';
import {
  useDeleteAnimalBatchesMutation,
  useDeleteAnimalsMutation,
  useRemoveAnimalBatchesMutation,
  useRemoveAnimalsMutation,
} from '../../../store/api/apiSlice';
import { toLocalISOString } from '../../../util/moment';
import { parseInventoryId } from '../../../util/animal';
import { CREATED_IN_ERROR_ID, FormFields } from '../../../components/Animals/RemoveAnimalsModal';
import useMutations from '../../../hooks/api/useMutations';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import { AnimalOrBatchKeys } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { completedTasksSelector, abandonedTasksSelector } from '../../taskSlice';
import { Animal, AnimalBatch } from '../../../store/api/types';
import { getLocalDateInYYYYDDMM } from '../../../util/date';
import { getTasks } from '../../Task/saga';

const useAnimalOrBatchRemoval = (
  selectedInventoryIds: string[],
  animalTasksWithInventoryIds: { id: string; tasks: Animal['tasks'] }[],
  setSelectedInventoryIds?: Dispatch<SetStateAction<string[]>>,
) => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['message']);
  const completedTasks = useSelector(completedTasksSelector) || [];
  const abandonedTasks = useSelector(abandonedTasksSelector) || [];

  const { mutations } = useMutations([
    { label: 'deleteAnimals', hook: useDeleteAnimalsMutation },
    { label: 'deleteBatches', hook: useDeleteAnimalBatchesMutation },
    { label: 'removeAnimals', hook: useRemoveAnimalsMutation },
    { label: 'removeBatches', hook: useRemoveAnimalBatchesMutation },
  ]);

  const [removalModalOpen, setRemovalModalOpen] = useState(false);

  const handleAnimalOrBatchRemoval = async (formData: FormFields) => {
    const timestampedDate = toLocalISOString(formData.date);

    const animalRemovalArray = [];
    const animalBatchRemovalArray = [];
    const selectedAnimalIds: string[] = [];
    const selectedBatchIds: string[] = [];
    let result;

    for (const id of selectedInventoryIds) {
      const { kind, id: entity_id } = parseInventoryId(id);
      if (kind === AnimalOrBatchKeys.ANIMAL) {
        animalRemovalArray.push({
          id: entity_id,
          animal_removal_reason_id: Number(formData.reason), // mobile UI uses a native radio input & will always generate a string
          removal_explanation: formData.explanation,
          removal_date: timestampedDate,
        });
        selectedAnimalIds.push(id);
      } else if (kind === AnimalOrBatchKeys.BATCH) {
        animalBatchRemovalArray.push({
          id: entity_id,
          animal_removal_reason_id: Number(formData.reason),
          removal_explanation: formData.explanation,
          removal_date: timestampedDate,
        });
        selectedBatchIds.push(id);
      }
    }

    if (animalRemovalArray.length) {
      result = await mutations['removeAnimals'].trigger(animalRemovalArray);

      if (result.error) {
        console.log(result.error);
        dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_ANIMALS', { ns: 'message' })));
      } else {
        setSelectedInventoryIds?.((selectedInventoryIds) =>
          selectedInventoryIds.filter((i) => !selectedAnimalIds.includes(i)),
        );
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_ANIMALS', { ns: 'message' })));
      }
    }

    if (animalBatchRemovalArray.length) {
      result = await mutations['removeBatches'].trigger(animalBatchRemovalArray);

      if (result.error) {
        console.log(result.error);
        dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_BATCHES', { ns: 'message' })));
      } else {
        setSelectedInventoryIds?.((selectedInventoryIds) =>
          selectedInventoryIds.filter((i) => !selectedBatchIds.includes(i)),
        );
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_BATCHES', { ns: 'message' })));
      }
    }

    setRemovalModalOpen(false);
    dispatch(getTasks());
    return result;
  };

  const handleAnimalOrBatchDeletion = async () => {
    const animalIds: number[] = [];
    const selectedAnimalIds: string[] = [];
    const animalBatchIds: number[] = [];
    const selectedBatchIds: string[] = [];
    const date = getLocalDateInYYYYDDMM();
    let result;

    for (const id of selectedInventoryIds) {
      const { kind, id: entity_id } = parseInventoryId(id);
      if (kind === AnimalOrBatchKeys.ANIMAL) {
        animalIds.push(entity_id);
        selectedAnimalIds.push(id);
      } else if (AnimalOrBatchKeys.BATCH) {
        animalBatchIds.push(entity_id);
        selectedBatchIds.push(id);
      }
    }

    if (animalIds.length) {
      result = await mutations['deleteAnimals'].trigger({ ids: animalIds, date });

      if (result.error) {
        console.log(result.error);
        dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_ANIMALS', { ns: 'message' })));
      } else {
        setSelectedInventoryIds?.((selectedInventoryIds) =>
          selectedInventoryIds.filter((i) => !selectedAnimalIds.includes(i)),
        );
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_ANIMALS', { ns: 'message' })));
      }
    }

    if (animalBatchIds.length) {
      result = await mutations['deleteBatches'].trigger({ ids: animalBatchIds, date });
      if (result.error) {
        console.log(result.error);
        dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_BATCHES', { ns: 'message' })));
      } else {
        setSelectedInventoryIds?.((selectedInventoryIds) =>
          selectedInventoryIds.filter((i) => !selectedBatchIds.includes(i)),
        );
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_BATCHES', { ns: 'message' })));
      }
    }

    setRemovalModalOpen(false);
    dispatch(getTasks());
    return result;
  };

  const onConfirmRemoveAnimals = async (formData: FormFields) => {
    if (Number(formData.reason) === CREATED_IN_ERROR_ID) {
      return handleAnimalOrBatchDeletion();
    } else {
      return handleAnimalOrBatchRemoval(formData);
    }
  };

  const getFinalizedTasks = useCallback(() => {
    return Array.from(new Set([...completedTasks, ...abandonedTasks]));
  }, [completedTasks, abandonedTasks]);

  const hasFinalizedTasks = useMemo(() => {
    if (!removalModalOpen) {
      return false;
    }

    const finalizedTasks = getFinalizedTasks();

    return selectedInventoryIds.some((id) =>
      finalizedTasks.filter(
        ({ animals, animal_batches }: { animals: Animal[]; animal_batches: AnimalBatch[] }) => {
          const animalIds = animals.map(({ id }) => `${id}`);
          const batchIds = animal_batches.map(({ id }) => `${id}`);
          return animalIds.includes(id) || batchIds.includes(id);
        },
      ),
    );
  }, [removalModalOpen, completedTasks, abandonedTasks, selectedInventoryIds]);

  return { onConfirmRemoveAnimals, removalModalOpen, setRemovalModalOpen, hasFinalizedTasks };
};

export default useAnimalOrBatchRemoval;
