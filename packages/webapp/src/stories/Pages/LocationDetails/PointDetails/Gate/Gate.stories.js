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
