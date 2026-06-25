/*
 *  Copyright 2026 LiteFarm.org
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
import type { StoryObj } from '@storybook/react';
import {
  CheckboxMultiSelect,
  CheckboxMultiSelectProps,
  type SelectOption,
} from '../../../components/Form/ReactSelect/CheckboxMultiSelect/';
import { componentDecorators } from '../../Pages/config/Decorators';

const defaultOptions: SelectOption[] = [
  { value: 'tomato', label: 'Tomato' },
  { value: 'lettuce', label: 'Lettuce' },
  { value: 'carrot', label: 'Carrot' },
  { value: 'cucumber', label: 'Cucumber' },
  { value: 'pepper', label: 'Pepper' },
];

interface CheckboxMultiSelectStoryArgs {
  options: SelectOption[];
  value: SelectOption[];
  isDisabled?: boolean;
  placeholder?: string;
  showSelectionStatus?: boolean;
  noOptionsMessage?: CheckboxMultiSelectProps['noOptionsMessage'];
}

const CheckboxMultiSelectWrapper = (args: CheckboxMultiSelectStoryArgs) => {
  const [value, setValue] = useState<SelectOption[]>(args.value);

  return (
    <CheckboxMultiSelect
      {...args}
      value={value}
      onChange={(newValue) => {
        setValue([...newValue] as SelectOption[]);
        console.log('onChange fired!', newValue);
      }}
    />
  );
};

type Story = StoryObj<CheckboxMultiSelectStoryArgs>;

export default {
  title: 'Components/Form/ReactSelect/CheckboxMultiSelect',
  component: CheckboxMultiSelect,
  decorators: componentDecorators,
  args: {
    options: defaultOptions,
    value: [],
  },
};

export const Default: Story = {
  render: (args) => <CheckboxMultiSelectWrapper {...args} />,
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    value: [defaultOptions[0], defaultOptions[2]],
  },
  render: (args) => <CheckboxMultiSelectWrapper {...args} />,
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Choose your vegetables...',
  },
  render: (args) => <CheckboxMultiSelectWrapper {...args} />,
};

export const WithSelectionStatus: Story = {
  args: {
    showSelectionStatus: true,
  },
  render: (args) => <CheckboxMultiSelectWrapper {...args} />,
};

export const WithCustomNoOptionsMessage: Story = {
  args: {
    options: [],
    noOptionsMessage: () => <span>You have no options</span>,
  },
  render: (args) => <CheckboxMultiSelectWrapper {...args} />,
};
