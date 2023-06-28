/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import labels from 'react-phone-number-input/locale/en';
import PhoneNumberInput from '../../../components/Form/PhoneNumberInput';
import { componentDecorators } from '../../Pages/config/Decorators';
import { getCountries } from 'react-phone-number-input';

const options = getCountries().map((country) => {
  return {
    label: country,
    value: country,
  };
});

export default {
  title: 'Components/Input/PhoneNumberInput',
  component: PhoneNumberInput,
  decorators: componentDecorators,
};

const Template = (args) => {
  return <PhoneNumberInput {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  defaultCountry: 'CA',
  labels,
  options,
};
