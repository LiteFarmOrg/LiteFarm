import React from 'react';
import Barn from '../../../../../components/LocationDetailLayout/AreaDetails/Barn';
import decorator from '../../../config/decorators';

export default {
  title: 'Form/Location/Area/Barn',
  decorators: decorator,
  component: Barn,
};

const Template = (args) => <Barn {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
  history: (data) => {},
  submitForm: (data) => {},
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
  history: (data) => {},
  submitForm: (data) => {},
  system: 'metric',
  useHookFormPersist: () => ({
    persistedData: { grid_points: {}, total_area: 1, perimeter: 2 },
  }),
};
View.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
