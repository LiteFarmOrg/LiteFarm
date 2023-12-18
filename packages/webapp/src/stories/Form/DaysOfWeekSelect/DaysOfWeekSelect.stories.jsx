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
import DaysOfWeekSelect from '../../../components/Form/DaysOfWeekSelect';
import { componentDecorators } from '../../Pages/config/Decorators';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export default {
  title: 'Components/DaysOfWeekSelect',
  component: DaysOfWeekSelect,
  decorators: componentDecorators,
};

const Template = (args) => <DaysOfWeekSelect {...args} />;

export const Default = Template.bind({});
Default.args = {};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // The label is translated so this will only pass with Storybook set to English
  const Monday = canvas.getByLabelText('M');

  await userEvent.click(Monday);

  await expect(Monday.checked).toBe(true);
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  defaultValue: ['Wednesday'],
};

Disabled.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const Monday = canvas.getByLabelText('M');

  await userEvent.click(Monday);

  await expect(Monday.checked).toBe(false);
};

export const MaxTwo = Template.bind({});
MaxTwo.args = {
  maxSelect: 2,
  defaultValue: ['Thursday', 'Sunday'],
};

MaxTwo.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const Friday = canvas.getByLabelText('F');

  await userEvent.click(Friday);

  await expect(Friday.checked).toBe(false);

  const Thursday = canvas.getAllByLabelText('T')[1];

  await userEvent.click(Thursday);

  await userEvent.click(Friday);

  await expect(Friday.checked).toBe(true);
};

export const WithError = Template.bind({});
WithError.args = {
  maxSelect: 2,
  errors: 'Required',
};
