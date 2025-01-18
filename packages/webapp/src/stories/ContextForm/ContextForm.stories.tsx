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
import { ContextForm, Variant } from '../../components/Form/ContextForm';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof ContextForm> = {
  title: 'Components/ContextForm',
  component: ContextForm,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof ContextForm>;

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
  variant: Variant.STEPPER_PROGRESS_BAR,
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

const asyncFunc = async (status: 'success' | 'fail') => {
  console.log(`Simulating ${status === 'success' ? 'successful' : 'failed'} API call...`);

  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (status === 'success') {
        resolve();
      } else {
        reject(new Error('ERROR'));
      }
    }, 1500);
  });
};

export const StepperFormWithCustomActionOnContinue: Story = {
  args: {
    ...stepperFormCommonProps,
    hasSummaryWithinForm: true,
    getSteps: () => [
      {
        title: 'Page 1',
        FormContent: () => <div>Page 1</div>,
        onContinueAction: () => asyncFunc('success'),
        dataName: 'sensor',
      },
      {
        title: 'Page 2',
        FormContent: () => <div>Page 2</div>,
        onContinueAction: () => asyncFunc('fail'),
      },
      {
        title: 'Done',
        FormContent: () => <div>Summary</div>,
      },
    ],
  },
};
