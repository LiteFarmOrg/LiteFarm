import React from 'react';
import Residence from '../../../../../components/LocationDetailLayout/AreaDetails/Residence';
import decorator from '../../../config/decorators';

export default {
  title: 'Form/Location/Area/Residence',
  decorators: decorator,
  component: Residence,
};

const Template = (args) => <Residence {...args} />;

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
