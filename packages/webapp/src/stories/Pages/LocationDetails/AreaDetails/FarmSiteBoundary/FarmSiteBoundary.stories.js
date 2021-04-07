import React from 'react';
import FarmSiteBoundary from '../../../../../components/LocationDetailLayout/AreaDetails/FarmSiteBoundary';
import decorator from '../../../config/decorators';

export default {
  title: 'Form/Location/Area/FarmSiteBoundary',
  decorators: decorator,
  component: FarmSiteBoundary,
};

const Template = (args) => <FarmSiteBoundary {...args} />;

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
