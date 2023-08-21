import React from 'react';
import BufferZone from '../../../../../components/LocationDetailLayout/LineDetails/BufferZone';
import decorator from '../../../config/Decorators';
import { chromaticSmallScreen } from '../../../config/chromatic';

export default {
  title: 'Form/Location/Line/BufferZone',
  decorators: decorator,
  component: BufferZone,
};

const Template = (args) => <BufferZone {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
  history: (data) => {},
  match: { params: { location_id: 1 } },
  submitForm: (data) => {},
  system: 'metric',
  isAdmin: true,

  persistedFormData: { name: 'location', grid_points: {}, width: 1, length: 2 },
};
Post.parameters = {
  ...chromaticSmallScreen,
};
export const View = Template.bind({});
View.args = {
  isViewLocationPage: true,
  history: { location: { pathname: '/buffer_zone/location_id/details' } },
  match: { params: { location_id: 'location_id' } },
  submitForm: (data) => {},
  system: 'metric',
  isAdmin: true,

  persistedFormData: { name: 'location', grid_points: {}, total_area: 1, perimeter: 2 },
};
View.parameters = {
  ...chromaticSmallScreen,
};

export const Edit = Template.bind({});
Edit.args = {
  match: { params: {} },
  isEditLocationPage: true,
  submitForm: (data) => {},
  system: 'metric',
  isAdmin: true,

  persistedFormData: { name: 'location', grid_points: {}, total_area: 1, perimeter: 2 },
};
Edit.parameters = {
  ...chromaticSmallScreen,
};
