import React from 'react';
import Gate from '../../../../../components/LocationDetailLayout/PointDetails/Gate';
import decorator from '../../../config/decorators';

export default {
  title: 'Form/Location/Point/Gate',
  decorators: decorator,
  component: Gate,
};

const Template = (args) => <Gate {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
  useHookFormPersist: () => ({
    persistedData: { point: {}, type: 'type' },
  }),
};
Post.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
export const View = Template.bind({});
View.args = {
  isViewLocationPage: true,
  history: { location: { pathname: '/gate/location_id/details' } },
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
