import React from 'react';
import CeremonialArea from '../../../../components/AreaDetailsLayout/CeremonialArea';
import decorator from '../../config/decorators';

export default {
  title: 'Form/Area/CeremonialArea',
  decorators: decorator,
  component: CeremonialArea,
};

const Template = (args) => <CeremonialArea {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: (data) => {},
  submitForm: (data) => {},
  system: 'metric',
  useHookFormPersist: () => ({
    persistedData: { grid_points: {}, total_area: 1, perimeter: 2 },
  }),
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
