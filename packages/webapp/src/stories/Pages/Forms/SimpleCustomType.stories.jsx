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
import PureSimpleCustomType from '../../../components/Forms/SimpleCustomType';
import decorators from '../config/Decorators';

export default {
  title: 'Forms/PureSimpleCustomType',
  decorators: decorators,
  component: PureSimpleCustomType,
};

const Template = (args) => <PureSimpleCustomType {...args} />;

const args = {
  useHookFormPersist: () => ({}),
  view: 'loading',
  handleGoBack: () => ({}),
  history: {},
  persistedFormData: {},
  onSave: () => ({}),
  EDIThandleGoBack: () => ({}),
  EDIThandleEdit: () => ({}),
  EDIThandleRetire: () => ({}),
  EDITselectedType: () => ({}),
  UPEDIThandleGoBack: () => ({}),
  UPEDIThistory: {},
  onAdd: () => ({}),
  handleEdit: () => ({}),
  onUpdate: () => ({}),
  onRetire: () => ({}),
};

export const Primary = Template.bind({});
Primary.args = {
  ...args,
};
