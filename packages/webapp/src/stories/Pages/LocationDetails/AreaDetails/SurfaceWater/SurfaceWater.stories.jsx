import React from 'react';
import SurfaceWater from '../../../../../components/LocationDetailLayout/AreaDetails/SurfaceWater';
import decorator from '../../../config/Decorators';
import { chromaticSmallScreen } from '../../../config/chromatic';

export default {
  title: 'Form/Location/Area/SurfaceWater',
  decorators: decorator,
  component: SurfaceWater,
};

const Template = (args) => <SurfaceWater {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
  history: (data) => {},
  match: { params: { location_id: 1 } },
  submitForm: (data) => {},
  areaType: (data) => {},
  system: 'metric',
  isAdmin: true,

  persistedFormData: { name: 'location', grid_points: {}, total_area: 1, perimeter: 2 },
};
Post.parameters = {
  ...chromaticSmallScreen,
};

export const View = Template.bind({});
View.args = {
  isViewLocationPage: true,
  history: { location: { pathname: '/surface_water/location_id/details' } },
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
