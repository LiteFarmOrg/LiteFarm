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
import styles from './styles.module.scss';
import { ContextForm, Variant } from '../../../components/Form/ContextForm/';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import AnimalReadonlyEdit from './AnimalReadonlyEdit';
import Tab, { Variant as TabVariants } from '../../../components/RouterTab/Tab';
import AnimalSingleViewHeader from '../../../components/Animals/AnimalSingleViewHeader';
import { generateFormDate, addNullsToClearedFields } from './utils';
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
import { useAnimalOptions } from '../AddAnimals/useAnimalOptions';
import {
  formatAnimalDetailsToDBStructure,
  formatBatchDetailsToDBStructure,
} from '../AddAnimals/utils';
import { Animal, AnimalBatch } from '../../../store/api/types';
import { AnimalOrBatchKeys } from '../types';
import type { Details } from '../../../components/Form/SexDetails/SexDetailsPopover';
import { AnimalDetailsFormFields, DetailsFields } from '../AddAnimals/types';

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

  const { sexDetailsOptions }: { sexDetailsOptions: Details } = useAnimalOptions('sexDetails');

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
    data: AnimalDetailsFormFields & Partial<Animal | AnimalBatch>,
    onGoForward: () => void,
    _setFormResultData: () => void,
    dirtyFields: Partial<Record<DetailsFields, boolean>>,
  ) => {
    const broughtInId = orgins.find((origin) => origin.key === 'BROUGHT_IN')?.id;

    const formattedAnimals: Partial<Animal>[] = [];
    const formattedBatches: Partial<AnimalBatch>[] = [];

    if (data.animal_or_batch === AnimalOrBatchKeys.ANIMAL) {
      const formattedAnimal = formatAnimalDetailsToDBStructure(data, broughtInId);
      const animalWithNullFields = addNullsToClearedFields(formattedAnimal, dirtyFields, {
        isBatch: false,
      });
      formattedAnimals.push({
        ...animalWithNullFields,
        id: data.id,
      });
    } else {
      const formattedBatch = formatBatchDetailsToDBStructure(data, broughtInId);
      const batchWithNullFields = addNullsToClearedFields(formattedBatch, dirtyFields, {
        isBatch: true,
      });

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

  const transformedSexDetails = sexDetailsOptions.map((option) => {
    const detail = selectedBatch?.sex_detail.find((detail) => detail.sex_id === option.id);
    if (detail) {
      return {
        ...option,
        count: detail.count,
      };
    }
    return option;
  });

  const defaultFormValues = {
    ...(selectedAnimal
      ? {
          ...selectedAnimal,
          [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.ANIMAL,
          [DetailsFields.DATE_OF_BIRTH]: generateFormDate(selectedAnimal.birth_date),
          [DetailsFields.BROUGHT_IN_DATE]: generateFormDate(selectedAnimal.brought_in_date),
          [DetailsFields.WEANING_DATE]: generateFormDate(selectedAnimal.weaning_date),
          [DetailsFields.OTHER_USE]: otherAnimalUse ? otherAnimalUse.other_use : null,
        }
      : {}),
    ...(selectedBatch
      ? {
          ...selectedBatch,
          [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.BATCH,
          [DetailsFields.DATE_OF_BIRTH]: generateFormDate(selectedBatch.birth_date),
          [DetailsFields.BROUGHT_IN_DATE]: generateFormDate(selectedBatch.brought_in_date),
          [DetailsFields.SEX_DETAILS]: transformedSexDetails,
          [DetailsFields.BATCH_NAME]: selectedBatch.name,
          [DetailsFields.OTHER_USE]: otherAnimalUse ? otherAnimalUse.other_use : null,
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
