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

import { Dispatch, SetStateAction, useState, useEffect } from 'react';
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
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const useAnimalOrBatchRemoval = (
  selectedInventoryIds: string[],
  setSelectedInventoryIds: Dispatch<SetStateAction<string[]>>,
) => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['message']);

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

    try {
      if (animalRemovalArray.length) {
        await mutations['removeAnimals'].trigger(animalRemovalArray).unwrap();
        setSelectedInventoryIds((selectedInventoryIds) =>
          selectedInventoryIds.filter((i) => !selectedAnimalIds.includes(i)),
        );
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_ANIMALS', { ns: 'message' })));
      }
    } catch (e) {
      console.log(e);
      dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_ANIMALS', { ns: 'message' })));
    }

    try {
      if (animalBatchRemovalArray.length) {
        await mutations['removeBatches'].trigger(animalBatchRemovalArray).unwrap();
        setSelectedInventoryIds((selectedInventoryIds) =>
          selectedInventoryIds.filter((i) => !selectedBatchIds.includes(i)),
        );
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_BATCHES', { ns: 'message' })));
      }
    } catch (e) {
      console.log(e);
      dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_BATCHES', { ns: 'message' })));
    }

    setRemovalModalOpen(false);
  };

  const handleAnimalOrBatchDeletion = async () => {
    const animalIds: number[] = [];
    const selectedAnimalIds: string[] = [];
    const animalBatchIds: number[] = [];
    const selectedBatchIds: string[] = [];

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

    try {
      if (animalIds.length) {
        await mutations['deleteAnimals'].trigger(animalIds).unwrap();
        setSelectedInventoryIds((selectedInventoryIds) =>
          selectedInventoryIds.filter((i) => !selectedAnimalIds.includes(i)),
        );
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_ANIMALS', { ns: 'message' })));
      }
    } catch (e) {
      console.log(e);
      dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_ANIMALS', { ns: 'message' })));
    }

    try {
      if (animalBatchIds.length) {
        await mutations['deleteBatches'].trigger(animalBatchIds).unwrap();
        setSelectedInventoryIds((selectedInventoryIds) =>
          selectedInventoryIds.filter((i) => !selectedBatchIds.includes(i)),
        );
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_BATCHES', { ns: 'message' })));
      }
    } catch (e) {
      console.log(e);
      dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_BATCHES', { ns: 'message' })));
    }

    setRemovalModalOpen(false);
  };

  const onConfirmRemoveAnimals = (formData: FormFields) => {
    if (Number(formData.reason) === CREATED_IN_ERROR_ID) {
      handleAnimalOrBatchDeletion();
    } else {
      handleAnimalOrBatchRemoval(formData);
    }
  };

  return { onConfirmRemoveAnimals, removalModalOpen, setRemovalModalOpen };
};

export default useAnimalOrBatchRemoval;
