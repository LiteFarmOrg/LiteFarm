import React from 'react';
import Field from '../../../../components/AreaDetailsLayout/Field';
import decorator from '../../config/decorators';

export default {
  title: 'Form/Area/Field',
  decorators: decorator,
  component: Field,
};

const Template = (args) => <Field {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: (data) => {},
  submitForm: (data) => {},
  areaType: (data) => {},
  system: 'metric',
  useHookFormPersist: () => ({
    persistedData: { grid_points: {}, total_area: 1, perimeter: 2 },
  }),
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
