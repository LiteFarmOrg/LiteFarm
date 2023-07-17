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
import PureRepeatCropPlan from '../../../components/RepeatCropPlan';
import decorators from '../config/Decorators';

export default {
  title: 'Form/RepeatCropPlan/PureRepeatCropPlan',
  decorators: decorators,
  component: PureRepeatCropPlan,
};

const Template = (args) => <PureRepeatCropPlan {...args} />;

const fakePlanData = {
  crop_common_name: 'Lavender',
  crop_variety_id: 'd0c5d192-115e-11ee-8a60-0242ac180002',
  crop_variety_name: 'Lavender',
  name: 'Wild crop harvest',
};

const fakeAllManagementPlansArray = [{ name: 'Wild crop harvest' }];

const args = {
  useHookFormPersist: () => ({}),
  cropPlan: fakePlanData,
  farmManagementPlansForCrop: fakeAllManagementPlansArray,
  origStartDate: '2023-07-17',
  onContinue: (data) => console.log('Submitting data', data),
};

export const Primary = Template.bind({});
Primary.args = {
  ...args,
};

export const FromPlanCreation = Template.bind({});
FromPlanCreation.args = {
  ...args,
  fromCreation: true,
};
