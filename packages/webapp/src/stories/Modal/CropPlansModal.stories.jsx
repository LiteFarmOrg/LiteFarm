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
import CropPlansModal from '../../components/Modals/CropModals/CropPlansModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/CropPlansModal',
  decorators: componentDecorators,
  component: CropPlansModal,
};

const Template = (args) => <CropPlansModal {...args} />;

export const commonArgs = {
  history: {
    location: { pathname: '/crop/variety_id/management' },
  },
  match: {
    params: {
      variety_id: 'variety_id',
    },
  },
  variety: {
    crop_translation_key: 'Blueberry',
    crop_variety_name: 'Nantes',
    supplier: 'Buckerfields',
    crop_variety_photo_url:
      'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp',
  },
  dismissModal: () => console.log('dismiss'),
};

export const planBaseContents = {
  managementPlanName: 'Management Plan',
  locationName: 'Field 1',
  notes: 'Row 1',
  numberOfPendingTask: 0,
  status: 'active',
  management_plan_group_id: '97643f51-6105-4462-aa21-a5048117017f',
};

export const ModalWithTwoCard = Template.bind({});
ModalWithTwoCard.args = {
  ...commonArgs,
  managementPlanCardContents: [...Array(2)].map((item, index) => {
    return {
      ...planBaseContents,
      repetition_count: 2,
      repetition_number: index + 1,
      startDate: `0${index + 7}-01-2023`,
      endDate: `0${index + 8}-02-2023`,
    };
  }),
};

ModalWithTwoCard.parameters = {
  ...chromaticSmallScreen,
};

export const ModalWithManyCards = Template.bind({});
ModalWithManyCards.args = {
  ...commonArgs,
  managementPlanCardContents: [...Array(20)].map((item, index) => {
    return {
      ...planBaseContents,
      repetition_count: 20,
      repetition_number: index + 1,
      startDate: `08-${(index + 1).toString().padStart(2, '0')}-2023`,
      endDate: `08-${(index + 2).toString().padStart(2, '0')}-2023`,
    };
  }),
};
ModalWithManyCards.parameters = {
  ...chromaticSmallScreen,
};

export const ModalWithDeletedIteration = Template.bind({});
ModalWithDeletedIteration.args = {
  ...commonArgs,
  managementPlanCardContents: [...Array(4)].map((item, index) => {
    return {
      ...planBaseContents,
      repetition_count: 5,
      repetition_number: index + (index < 2 ? 1 : 2),
      startDate: `0${index + 7}-01-2023`,
      endDate: `0${index + 8}-02-2023`,
    };
  }),
};
ModalWithDeletedIteration.parameters = {
  ...chromaticSmallScreen,
};
