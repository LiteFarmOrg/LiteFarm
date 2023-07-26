/*
 *  Copyright 2023 LiteFarm.org
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

import React from 'react';
import PureRepeatCropPlanConfirmation from '../../../components/RepeatCropPlan/Confirmation';
import decorators from '../config/Decorators';

export default {
  title: 'Form/RepeatCropPlan/PureRepeatCropPlanConfirmation',
  decorators: decorators,
  component: PureRepeatCropPlanConfirmation,
};

const Template = (args) => <PureRepeatCropPlanConfirmation {...args} />;

const commonArgs = {
  useHookFormPersist: () => ({}),
  onSubmit: (data) => console.log('Submitting data', data),
  onGoBack: () => ({}),
  tasks: [{}, {}],
};

const persistedFormData = {
  crop_plan_name: 'Repetitions of Plan A',
  plan_start_date: '2023-08-01',
  finish: 'after',
  repeat_frequency: '1',
  after_occurrences: '10',
};

export const Daily = Template.bind({});
Daily.args = {
  ...commonArgs,
  persistedFormData: {
    ...persistedFormData,
    repeat_interval: { value: 'day', label: 'day(s)' },
    repeat_frequency: '3',
  },
};

export const Weekly = Template.bind({});
Weekly.args = {
  ...commonArgs,
  persistedFormData: {
    ...persistedFormData,
    repeat_interval: { value: 'week', label: 'week(s)' },
    days_of_week: ['Friday'],
    finish: 'on',
    finish_on_date: '2023-08-31',
  },
};

export const MonthlyDate = Template.bind({});
MonthlyDate.args = {
  ...commonArgs,
  persistedFormData: {
    ...persistedFormData,
    repeat_interval: { value: 'month', label: 'month(s)' },
    month_repeat_on: { value: 20 },
  },
};

export const MonthlyDayOfWeek = Template.bind({});
MonthlyDayOfWeek.args = {
  ...commonArgs,
  persistedFormData: {
    ...persistedFormData,
    repeat_interval: { value: 'month', label: 'month(s)' },
    month_repeat_on: { value: { weekday: 'MO', ordinal: 3 } },
    finish: 'on',
    finish_on_date: '2024-08-01',
  },
};

export const Yearly = Template.bind({});
Yearly.args = {
  ...commonArgs,
  persistedFormData: {
    ...persistedFormData,
    repeat_interval: { value: 'year', label: 'year(s)' },
  },
};
