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
import styles from './styles.module.scss';
import { ContextForm, Variant } from '../../../components/Form/ContextForm/';
import AnimalReadonlyEdit from './AnimalReadonlyEdit';
import Button from '../../../components/Form/Button';
import Tab, { Variant as TabVariants } from '../../../components/RouterTab/Tab';
import { generateFormDate } from './utils';

// Form Submission
import {
  useGetAnimalsQuery,
  useGetAnimalBatchesQuery,
  useGetAnimalOriginsQuery,
  useUpdateAnimalsMutation,
  useUpdateAnimalBatchesMutation,
} from '../../../store/api/apiSlice';
import {
  formatAnimalDetailsToDBStructure,
  formatBatchDetailsToDBStructure,
} from '../AddAnimals/utils';
import { AnimalOrBatchKeys } from '../types';
import { useDispatch } from 'react-redux';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import { Animal, AnimalBatch } from '../../../store/api/types';

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

  const { data: animals = [] } = useGetAnimalsQuery();
  const { data: batches = [] } = useGetAnimalBatchesQuery();

  const selectedAnimal = animals.find(
    (animal) => animal.internal_identifier === Number(match.params.id),
  );
  const selectedBatch = batches.find(
    (batch) => batch.internal_identifier === Number(match.params.id),
  );

  const [isEditing, setIsEditing] = useState(false);

  // For now, assuming that the only way to exit edit will be through the cancel button and not through the header
  const initiateEdit = () => {
    setIsEditing(true);
  };

  // Form submission logic, based on AddAnimals
  const dispatch = useDispatch();

  const [updateAnimals] = useUpdateAnimalsMutation();
  const [updateBatches] = useUpdateAnimalBatchesMutation();

  const { data: orgins = [] } = useGetAnimalOriginsQuery();

  const onSave = async (
    data: any,
    onGoForward: () => void,
    // setFormResultData: (data: any) => void, // only needed for summary
  ) => {
    const broughtInId = orgins.find((origin) => origin.key === 'BROUGHT_IN')?.id;

    const formattedAnimals: Partial<Animal>[] = [];
    const formattedBatches: Partial<AnimalBatch>[] = [];

    if (data.animal_or_batch === AnimalOrBatchKeys.ANIMAL) {
      formattedAnimals.push({
        ...formatAnimalDetailsToDBStructure(data, broughtInId),
        id: data.id, // wasn't yet present on Add flow
      });
    } else {
      formattedBatches.push({
        ...formatBatchDetailsToDBStructure(data, broughtInId),
        id: data.id,
      });
    }

    let animalsResult: Animal[] = [];
    let batchesResult: AnimalBatch[] = [];

    try {
      if (formattedAnimals.length) {
        animalsResult = await updateAnimals(formattedAnimals).unwrap();
        dispatch(enqueueSuccessSnackbar(t('message:ANIMALS.SUCCESS_CREATE_ANIMALS')));
      }
    } catch (e) {
      console.error(e);
      dispatch(enqueueErrorSnackbar(t('message:ANIMALS.FAILED_CREATE_ANIMALS')));
    }
    try {
      if (formattedBatches.length) {
        batchesResult = await updateBatches(formattedBatches).unwrap();
        dispatch(enqueueSuccessSnackbar(t('message:ANIMALS.SUCCESS_CREATE_BATCHES')));
      }
    } catch (e) {
      console.error(e);
      dispatch(enqueueErrorSnackbar(t('message:ANIMALS.FAILED_CREATE_BATCHES')));
    }

    if (!animalsResult.length && !batchesResult.length) {
      return;
    }

    // only needed for summary
    // setFormResultData({ animals: animalsResult, batches: batchesResult });
    onGoForward();
  };

  const getFormSteps = () => [
    {
      FormContent: AnimalReadonlyEdit,
      title: t('ADD_ANIMAL.ANIMAL_DETAILS'),
    },
  ];

  const defaultFormValues = {
    ...(selectedAnimal
      ? {
          ...selectedAnimal,
          animal_or_batch: AnimalOrBatchKeys.ANIMAL,
          birth_date: generateFormDate(selectedAnimal.birth_date),
          brought_in_date: generateFormDate(selectedAnimal.brought_in_date),
          weaning_date: generateFormDate(selectedAnimal.weaning_date),
        }
      : {}),
    ...(selectedBatch
      ? {
          ...selectedBatch,
          animal_or_batch: AnimalOrBatchKeys.BATCH,
          birth_date: generateFormDate(selectedBatch.birth_date),
          brought_in_date: generateFormDate(selectedBatch.brought_in_date),
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
        {/* TODO: LF-4381 Header component */}
        <h1>LF-4381 Header component</h1>
        {isEditing ? (
          <Button color={'primary'} disabled>
            ...Editing
          </Button>
        ) : (
          <Button color={'secondary-cta'} onClick={initiateEdit}>
            Toggle Edit
          </Button>
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
        key={isEditing ? 'edit' : 'readonly'}
      />
    </div>
  );
}

export default SingleAnimalView;
