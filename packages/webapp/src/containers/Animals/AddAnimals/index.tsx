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

import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { History } from 'history';
import { useMediaQuery } from '@mui/material';
import theme from '../../../assets/theme';
import { ContextForm, Variant } from '../../../components/Form/ContextForm/';
import AddAnimalBasics, { animalBasicsDefaultValues } from './AddAnimalBasics';
import AddAnimalDetails from './AddAnimalDetails';
import AddAnimalSummary from './AddAnimalSummary';
import {
  useAddAnimalBatchesMutation,
  useAddAnimalsMutation,
  useGetAnimalOriginsQuery,
} from '../../../store/api/apiSlice';
import { Animal, AnimalBatch } from '../../../store/api/types';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import { formatAnimalDetailsToDBStructure, formatBatchDetailsToDBStructure } from './utils';
import { AnimalDetailsFormFields } from './types';
import { AnimalOrBatchKeys } from '../types';

export const STEPS = {
  BASICS: 'basics',
  DETAILS: 'details',
} as const;

interface AddAnimalsProps {
  isCompactSideMenu: boolean;
  history: History;
}

function AddAnimals({ isCompactSideMenu, history }: AddAnimalsProps) {
  const { t } = useTranslation(['translation', 'common', 'message']);
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [addAnimals] = useAddAnimalsMutation();
  const [addAnimalBatches] = useAddAnimalBatchesMutation();

  const { data: orgins = [] } = useGetAnimalOriginsQuery();

  const onSave = async (
    data: any,
    onGoForward: () => void,
    setFormResultData: (data: any) => void,
  ) => {
    const details = data[STEPS.DETAILS] as AnimalDetailsFormFields[];
    const broughtInId = orgins.find((origin) => origin.key === 'BROUGHT_IN')?.id;

    const formattedAnimals: Partial<Animal>[] = [];
    const formattedBatches: Partial<AnimalBatch>[] = [];

    details.forEach((animalOrBatch) => {
      if (animalOrBatch.animal_or_batch === AnimalOrBatchKeys.ANIMAL) {
        formattedAnimals.push(formatAnimalDetailsToDBStructure(animalOrBatch, broughtInId));
      } else {
        formattedBatches.push(formatBatchDetailsToDBStructure(animalOrBatch, broughtInId));
      }
    });

    let animalsResult: Animal[] = [];
    let batchesResult: AnimalBatch[] = [];

    try {
      if (formattedAnimals.length) {
        animalsResult = await addAnimals(formattedAnimals).unwrap();
        dispatch(enqueueSuccessSnackbar(t('message:ANIMALS.SUCCESS_CREATE_ANIMALS')));
      }
    } catch (e) {
      console.error(e);
      dispatch(enqueueErrorSnackbar(t('message:ANIMALS.FAILED_CREATE_ANIMALS')));
    }
    try {
      if (formattedBatches.length) {
        batchesResult = await addAnimalBatches(formattedBatches).unwrap();
        dispatch(enqueueSuccessSnackbar(t('message:ANIMALS.SUCCESS_CREATE_BATCHES')));
      }
    } catch (e) {
      console.error(e);
      dispatch(enqueueErrorSnackbar(t('message:ANIMALS.FAILED_CREATE_BATCHES')));
    }

    if (!animalsResult.length && !batchesResult.length) {
      return;
    }

    setFormResultData({ animals: animalsResult, batches: batchesResult });
    onGoForward();
  };

  const getFormSteps = () => [
    {
      FormContent: AddAnimalBasics,
      title: t('ADD_ANIMAL.ANIMAL_BASICS'),
    },
    {
      FormContent: AddAnimalDetails,
      title: t('ADD_ANIMAL.ANIMAL_DETAILS'),
    },
    {
      FormContent: AddAnimalSummary,
      title: t('common:DONE'),
    },
  ];

  const stepperProgressBarConfig = { isMobile, isDarkMode: true };

  const defaultFormValues = {
    [STEPS.BASICS]: [animalBasicsDefaultValues],
    [STEPS.DETAILS]: [],
  };

  return (
    <ContextForm
      stepperProgressBarTitle={isMobile && t('ADD_ANIMAL.ADD_ANIMALS_TITLE')}
      stepperProgressBarConfig={stepperProgressBarConfig}
      onSave={onSave}
      hasSummaryWithinForm={true}
      isCompactSideMenu={isCompactSideMenu}
      variant={Variant.STEPPER_PROGRESS_BAR}
      history={history}
      getSteps={getFormSteps}
      defaultFormValues={defaultFormValues}
      cancelModalTitle={t('ADD_ANIMAL.ADD_ANIMALS_FLOW')}
    />
  );
}

export default AddAnimals;
