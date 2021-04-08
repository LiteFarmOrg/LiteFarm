import React from 'react';
import WaterValve from '../../../../../components/LocationDetailLayout/PointDetails/WaterValve';
import decorator from '../../../config/decorators';

export default {
  title: 'Form/Location/Point/WaterValve',
  decorators: decorator,
  component: WaterValve,
};

const Template = (args) => <WaterValve {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
  useHookFormPersist: () => ({
    persistedData: { point: {}, type: 'type' },
  }),
  system: 'imperial',
};
Post.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
