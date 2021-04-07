import React from 'react';
import SurfaceWater from '../../../../../components/LocationDetailLayout/AreaDetails/SurfaceWater';
import decorator from '../../../config/decorators';

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
  submitForm: (data) => {},
  system: 'metric',
  useHookFormPersist: () => ({
    persistedData: { grid_points: {}, total_area: 1, perimeter: 2 },
  }),
};
Post.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
