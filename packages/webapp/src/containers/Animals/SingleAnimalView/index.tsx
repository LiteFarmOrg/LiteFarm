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
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { pick as _pick } from 'lodash-es';
import styles from './styles.module.scss';
import { ContextForm, Variant } from '../../../components/Form/ContextForm/';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import AnimalReadonlyEdit from './AnimalReadonlyEdit';
import Tab, { Variant as TabVariants } from '../../../components/RouterTab/Tab';
import AnimalSingleViewHeader from '../../../components/Animals/AnimalSingleViewHeader';
import { generateFormDate, getChangedFields, addNullsToClearedFields } from './utils';
import {
  useGetAnimalsQuery,
  useGetAnimalBatchesQuery,
  useGetAnimalOriginsQuery,
  useUpdateAnimalsMutation,
  useUpdateAnimalBatchesMutation,
  useGetCustomAnimalBreedsQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetDefaultAnimalTypesQuery,
} from '../../../store/api/apiSlice';
import {
  formatAnimalDetailsToDBStructure,
  formatBatchDetailsToDBStructure,
} from '../AddAnimals/utils';
import { Animal, AnimalBatch } from '../../../store/api/types';
import { AnimalOrBatchKeys } from '../types';

export const STEPS = {
  DETAILS: 'details',
} as const;

interface RouteParams {
  id: string;
}

interface AddAnimalsProps extends RouteComponentProps<RouteParams> {
  isCompactSideMenu: boolean;
}

function SingleAnimalView({ isCompactSideMenu, history, match }: AddAnimalsProps) {
  const { t } = useTranslation(['translation', 'common', 'message']);

  // Header
  const { data: customAnimalTypes = [] } = useGetCustomAnimalTypesQuery();
  const { data: customAnimalBreeds = [] } = useGetCustomAnimalBreedsQuery();
  const { data: defaultAnimalTypes = [] } = useGetDefaultAnimalTypesQuery();
  const { data: defaultAnimalBreeds = [] } = useGetDefaultAnimalBreedsQuery();

  // Form
  const { data: animals = [] } = useGetAnimalsQuery();
  const { data: batches = [] } = useGetAnimalBatchesQuery();

  const selectedAnimal = animals.find(
    (animal) => animal.internal_identifier === Number(match.params.id),
  );
  const selectedBatch = batches.find(
    (batch) => batch.internal_identifier === Number(match.params.id),
  );

  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const dispatch = useDispatch();

  const [updateAnimals] = useUpdateAnimalsMutation();
  const [updateBatches] = useUpdateAnimalBatchesMutation();

  const { data: orgins = [] } = useGetAnimalOriginsQuery();

  const onSave = async (
    data: any,
    onGoForward: () => void,
    _setFormResultData: () => void,
    dirtyFields: any,
  ) => {
    const broughtInId = orgins.find((origin) => origin.key === 'BROUGHT_IN')?.id;

    const formattedAnimals: Partial<Animal>[] = [];
    const formattedBatches: Partial<AnimalBatch>[] = [];

    const changedFields = getChangedFields(dirtyFields);

    if (data.animal_or_batch === AnimalOrBatchKeys.ANIMAL) {
      const formattedAnimal = _pick(
        formatAnimalDetailsToDBStructure(data, broughtInId),
        changedFields,
      );
      const animalWithNullFields = addNullsToClearedFields(formattedAnimal, dirtyFields);

      formattedAnimals.push({
        ...animalWithNullFields,
        id: data.id,
      });
    } else {
      const formattedBatch = _pick(
        formatBatchDetailsToDBStructure(data, broughtInId),
        changedFields,
      );
      const batchWithNullFields = addNullsToClearedFields(formattedBatch, dirtyFields);

      formattedBatches.push({
        ...batchWithNullFields,
        id: data.id,
      });
    }

    try {
      if (formattedAnimals.length) {
        await updateAnimals(formattedAnimals).unwrap();
        dispatch(enqueueSuccessSnackbar(t('message:ANIMALS.SUCCESS_UPDATE_ANIMAL')));
      }
    } catch (e) {
      console.error(e);
      dispatch(enqueueErrorSnackbar(t('message:ANIMALS.FAILED_UPDATE_ANIMAL')));
    }
    try {
      if (formattedBatches.length) {
        await updateBatches(formattedBatches).unwrap();
        dispatch(enqueueSuccessSnackbar(t('message:ANIMALS.SUCCESS_UPDATE_BATCH')));
      }
    } catch (e) {
      console.error(e);
      dispatch(enqueueErrorSnackbar(t('message:ANIMALS.FAILED_UPDATE_BATCH')));
    }

    onGoForward();
  };

  const getFormSteps = () => [
    {
      FormContent: AnimalReadonlyEdit,
      title: t('ADD_ANIMAL.ANIMAL_DETAILS'),
    },
  ];

  const otherAnimalUse =
    selectedAnimal?.animal_use_relationships?.find(
      (relationship) => relationship?.other_use !== null,
    ) ||
    selectedBatch?.animal_batch_use_relationships?.find(
      (relationship) => relationship?.other_use !== null,
    );

  const defaultFormValues = {
    ...(selectedAnimal
      ? {
          ...selectedAnimal,
          animal_or_batch: AnimalOrBatchKeys.ANIMAL,
          birth_date: generateFormDate(selectedAnimal.birth_date),
          brought_in_date: generateFormDate(selectedAnimal.brought_in_date),
          weaning_date: generateFormDate(selectedAnimal.weaning_date),
          other_use: otherAnimalUse ? otherAnimalUse.other_use : null,
        }
      : {}),
    ...(selectedBatch
      ? {
          ...selectedBatch,
          animal_or_batch: AnimalOrBatchKeys.BATCH,
          birth_date: generateFormDate(selectedBatch.birth_date),
          brought_in_date: generateFormDate(selectedBatch.brought_in_date),
          other_use: otherAnimalUse ? otherAnimalUse.other_use : null,
        }
      : {}),
  };

  const routerTabs = [
    {
      label: t('ANIMAL.TABS.BASIC_INFO'),
      path: match.url,
    },
    {
      label: t('ANIMAL.TABS.TASKS'),
      path: `${match.url}/tasks`,
    },
  ];

  return (
    <div className={styles.container}>
      <div>
        {defaultFormValues && (
          <AnimalSingleViewHeader
            onEdit={toggleEdit}
            isEditing={isEditing}
            onBack={() => history.push('/animals/inventory')}
            /* @ts-ignore */
            animalOrBatch={defaultFormValues}
            defaultBreeds={defaultAnimalBreeds}
            defaultTypes={defaultAnimalTypes}
            customBreeds={customAnimalBreeds}
            customTypes={customAnimalTypes}
          />
        )}
      </div>
      <Tab
        tabs={routerTabs}
        variant={TabVariants.UNDERLINE}
        isSelected={(tab) => tab.path === match.url}
        onClick={(tab) => history.push(tab.path)}
      />
      <ContextForm
        onSave={onSave}
        hasSummaryWithinForm={false}
        isCompactSideMenu={isCompactSideMenu}
        variant={Variant.STEPPER_PROGRESS_BAR}
        history={history}
        getSteps={getFormSteps}
        defaultFormValues={defaultFormValues}
        cancelModalTitle={t('ANIMALS.EDIT_ANIMAL_FLOW')}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        key={`${JSON.stringify(defaultFormValues)}${isEditing}`}
      />
    </div>
  );
}

export default SingleAnimalView;
