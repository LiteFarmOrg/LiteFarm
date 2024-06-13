/*
 *  Copyright 2022-2024 LiteFarm.org
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

import Switch from '../../../components/Form/Switch';
import { componentDecorators } from '../../Pages/config/Decorators';

export default {
  title: 'Components/Switch',
  component: Switch,
  decorators: componentDecorators,
};

const Template = (args) => <Switch {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const Checked = Template.bind({});
Checked.args = {
  checked: true,
};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: 'Switch',
};

export const WithLeftLabel = Template.bind({});
WithLeftLabel.args = {
  leftLabel: 'Switch',
};

export const ToggleVariant = Template.bind({});
ToggleVariant.args = {
  leftLabel: 'Left',
  label: 'Right',
  isToggleVariant: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  leftLabel: 'Left',
  label: 'Right',
  isToggleVariant: true,
  disabled: true,
};
