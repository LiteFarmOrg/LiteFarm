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
import { History } from 'history';
import { useMediaQuery } from '@mui/material';
import theme from '../../../assets/theme';
import { MultiStepForm, VARIANT } from '../../../components/Form/MultiStepForm';
import AddAnimalBasics from '../AddAnimalBasics';
import AddAnimalDetails from '../AddAnimalDetails';
import AddAnimalSummary from '../AddAnimalSummary';

export const STEPS = {
  BASICS: 'basics',
  DETAILS: 'details',
};

interface AddAnimalsProps {
  isCompactSideMenu: boolean;
  history: History;
}

function AddAnimals({ isCompactSideMenu, history }: AddAnimalsProps) {
  const { t } = useTranslation(['translation', 'common']);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const onSave = (data: any, onGoForward: () => void) => {
    // TODO: API request
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
    [STEPS.BASICS]: [],
    [STEPS.DETAILS]: [],
  };

  return (
    <MultiStepForm
      stepperProgressBarConfig={stepperProgressBarConfig}
      onSave={onSave}
      hasSummaryWithinForm={true}
      isCompactSideMenu={isCompactSideMenu}
      variant={VARIANT.STEPPER_PROGRESS_BAR}
      history={history}
      getSteps={getFormSteps}
      defaultFormValues={defaultFormValues}
    />
  );
}

export default AddAnimals;
