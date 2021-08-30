import React from 'react';
import PureCropManagement from '../../../components/Crop/management';
import decorator from '../config/decorators';
import { Abandoned, Active, Completed, Planned } from '../../Card/ManagementPlanCard.stories';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Crop/Management',
  component: PureCropManagement,
  decorators: decorator,
};

const Template = (args) => <PureCropManagement {...args} />;

const managementPlanCardContents = [Active.args, Planned.args, Abandoned.args, Completed.args];

const getManagementPlanCardContents = (numberOfCards) =>
  Array.from({ length: numberOfCards }, (_, index) => {
    return managementPlanCardContents[index % 4];
  });

export const Management = Template.bind({});
Management.args = {
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
};
Management.parameters = {
  ...chromaticSmallScreen,
};

export const ManagementWithOneCard = Template.bind({});
ManagementWithOneCard.args = {
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
  managementPlanCardContents: [managementPlanCardContents[0]],
};
ManagementWithOneCard.parameters = {
  ...chromaticSmallScreen,
};

export const ManagementWithManyCards = Template.bind({});
ManagementWithManyCards.args = {
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
  managementPlanCardContents: getManagementPlanCardContents(100),
};
ManagementWithManyCards.parameters = {
  ...chromaticSmallScreen,
};
