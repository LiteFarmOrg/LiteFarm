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

import { useState } from 'react';
import {
  useDeleteAnimalBatchesMutation,
  useDeleteAnimalsMutation,
  useRemoveAnimalBatchesMutation,
  useRemoveAnimalsMutation,
} from '../../../store/api/apiSlice';
import { toLocalISOString } from '../../../util/moment';
import { CREATED_IN_ERROR_ID, FormFields } from '../../../components/Animals/RemoveAnimalsModal';
import useMutations from '../../../hooks/api/useMutations';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import { AnimalOrBatchKeys } from '../types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Animal } from '../../../store/api/types';

interface Removal {
  id: Animal['id'];
  animal_removal_reason_id: number;
  removal_explanation: string;
  removal_date: string;
}

const useAnimalOrBatchRemoval = (
  selectedIds: { kind: AnimalOrBatchKeys; id: Animal['id'] }[],
  onSuccess?: (kind: AnimalOrBatchKeys, ids: Animal['id'][]) => void,
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

    const animalRemovalArray: Removal[] = [];
    const animalBatchRemovalArray: Removal[] = [];
    const selectedAnimalIds: Animal['id'][] = [];
    const selectedBatchIds: Animal['id'][] = [];
    let result;

    for (const { kind, id } of selectedIds) {
      const [removalArray, selectedIdsArray] =
        kind === AnimalOrBatchKeys.ANIMAL
          ? [animalRemovalArray, selectedAnimalIds]
          : [animalBatchRemovalArray, selectedBatchIds];

      removalArray.push({
        id,
        animal_removal_reason_id: Number(formData.reason), // mobile UI uses a native radio input & will always generate a string
        removal_explanation: formData.explanation,
        removal_date: timestampedDate,
      });
      selectedIdsArray.push(id);
    }

    if (animalRemovalArray.length) {
      result = await mutations['removeAnimals'].trigger(animalRemovalArray);

      if (result.error) {
        console.log(result.error);
        dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_ANIMALS', { ns: 'message' })));
      } else {
        onSuccess?.(AnimalOrBatchKeys.ANIMAL, selectedAnimalIds);
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_ANIMALS', { ns: 'message' })));
      }
    }

    if (animalBatchRemovalArray.length) {
      result = await mutations['removeBatches'].trigger(animalBatchRemovalArray);

      if (result.error) {
        console.log(result.error);
        dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_BATCHES', { ns: 'message' })));
      } else {
        onSuccess?.(AnimalOrBatchKeys.BATCH, selectedBatchIds);
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_BATCHES', { ns: 'message' })));
      }
    }

    setRemovalModalOpen(false);
    return result;
  };

  const handleAnimalOrBatchDeletion = async () => {
    const animalIds: number[] = [];
    const animalBatchIds: number[] = [];
    let result;

    for (const { kind, id } of selectedIds) {
      const idsArray = kind === AnimalOrBatchKeys.ANIMAL ? animalIds : animalBatchIds;
      idsArray.push(id);
    }

    if (animalIds.length) {
      result = await mutations['deleteAnimals'].trigger(animalIds);

      if (result.error) {
        console.log(result.error);
        dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_ANIMALS', { ns: 'message' })));
      } else {
        onSuccess?.(AnimalOrBatchKeys.ANIMAL, animalIds);
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_ANIMALS', { ns: 'message' })));
      }
    }

    if (animalBatchIds.length) {
      result = await mutations['deleteBatches'].trigger(animalBatchIds);
      if (result.error) {
        console.log(result.error);
        dispatch(enqueueErrorSnackbar(t('ANIMALS.FAILED_REMOVE_BATCHES', { ns: 'message' })));
      } else {
        onSuccess?.(AnimalOrBatchKeys.BATCH, animalBatchIds);
        dispatch(enqueueSuccessSnackbar(t('ANIMALS.SUCCESS_REMOVE_BATCHES', { ns: 'message' })));
      }
    }

    setRemovalModalOpen(false);
    return result;
  };

  const onConfirmRemoveAnimals = async (formData: FormFields) => {
    if (Number(formData.reason) === CREATED_IN_ERROR_ID) {
      return handleAnimalOrBatchDeletion();
    } else {
      return handleAnimalOrBatchRemoval(formData);
    }
  };

  return { onConfirmRemoveAnimals, removalModalOpen, setRemovalModalOpen };
};

export default useAnimalOrBatchRemoval;
