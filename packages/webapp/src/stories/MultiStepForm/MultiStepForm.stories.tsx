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

import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import { MultiStepForm, VARIANT } from '../../components/Form/MultiStepForm';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof MultiStepForm> = {
  title: 'Components/MultiStepForm',
  component: MultiStepForm,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof MultiStepForm>;

export const PageTitle: Story = {
  args: {
    getSteps: () => [
      {
        title: 'Add expense',
        FormContent: () => <div>Add expense</div>,
      },
      {
        title: 'New expense item',
        FormContent: () => <div>New expense item</div>,
      },
    ],
    cancelModalTitle: 'expense creation',
    defaultFormValues: {},
  },
};

const stepperFormCommonProps = {
  stepperProgressBarConfig: {
    isMobile: false,
    isDarkMode: true,
  },
  onSave: (data: any, onGoForward: () => void) => {
    console.log('add animals', data);
    onGoForward();
  },
  isCompactSideMenu: true,
  variant: VARIANT.STEPPER_PROGRESS_BAR,
  history: { block: () => () => ({}) },
  getSteps: () => [
    {
      title: 'Page 1',
      FormContent: () => <div>Page 1</div>,
    },
    {
      title: 'Page 2',
      FormContent: () => <div>Page 2</div>,
    },
    {
      title: 'Page 3',
      FormContent: () => <div>Page 3</div>,
    },
  ],
  defaultFormValues: {},
};

export const StepperForm: Story = {
  args: stepperFormCommonProps,
};

export const StepperFormWithSummaryPage: Story = {
  args: {
    ...stepperFormCommonProps,
    hasSummaryWithinForm: true,
    getSteps: () => [
      {
        title: 'Page 1',
        FormContent: () => <div>Page 1</div>,
      },
      {
        title: 'Page 2',
        FormContent: () => <div>Page 2</div>,
      },
      {
        title: 'Done',
        FormContent: () => <div>Summary</div>,
      },
    ],
  },
};
