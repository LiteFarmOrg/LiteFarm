import React from 'react';
import Garden from '../../../../../components/LocationDetailLayout/AreaDetails/Garden';
import decorator from '../../../config/decorators';

export default {
  title: 'Form/Location/Area/Garden',
  decorators: decorator,
  component: Garden,
};

const Template = (args) => <Garden {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
  history: (data) => {},
  submitForm: (data) => {},
  areaType: (data) => {},
  system: 'metric',
  useHookFormPersist: () => ({
    persistedData: { grid_points: {}, total_area: 1, perimeter: 2 },
  }),
};
Post.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const View = Template.bind({});
View.args = {
  isViewLocationPage: true,
  history: { location: { pathname: '/garden/location_id/details' } },
  match: { params: { location_id: 'location_id' } },
  submitForm: (data) => {},
  system: 'metric',
  useHookFormPersist: () => ({
    persistedData: { grid_points: {}, total_area: 1, perimeter: 2 },
  }),
};
View.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const Edit = Template.bind({});
Edit.args = {
  isEditLocationPage: true,
  submitForm: (data) => {},
  system: 'metric',
  useHookFormPersist: () => ({
    persistedData: { grid_points: {}, total_area: 1, perimeter: 2 },
  }),
};
Edit.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
