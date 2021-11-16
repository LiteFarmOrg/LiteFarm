import React from 'react';
import Watercourse from '../../../../../components/LocationDetailLayout/LineDetails/Watercourse';
import decorator from '../../../config/decorators';
import { chromaticSmallScreen } from '../../../config/chromatic';

export default {
  title: 'Form/Location/Line/Watercourse',
  decorators: decorator,
  component: Watercourse,
};

const Template = (args) => <Watercourse {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
  history: (data) => {},
  system: 'metric',
  isAdmin: true,
  useHookFormPersist: () => ({
    persistedData: { grid_points: {}, width: 1, length: 2 },
  }),
};
Post.parameters = {
  ...chromaticSmallScreen,
};
export const View = Template.bind({});
View.args = {
  isViewLocationPage: true,
  history: { location: { pathname: '/watercourse/location_id/details' } },
  match: { params: { location_id: 'location_id' } },
  submitForm: (data) => {},
  system: 'metric',
  isAdmin: true,
  useHookFormPersist: () => ({
    persistedData: { grid_points: {}, total_area: 1, perimeter: 2 },
  }),
};
View.parameters = {
  ...chromaticSmallScreen,
};

export const Edit = Template.bind({});
Edit.args = {
  isEditLocationPage: true,
  submitForm: (data) => {},
  system: 'metric',
  isAdmin: true,
  useHookFormPersist: () => ({
    persistedData: { grid_points: {}, total_area: 1, perimeter: 2 },
  }),
};
Edit.parameters = {
  ...chromaticSmallScreen,
};
