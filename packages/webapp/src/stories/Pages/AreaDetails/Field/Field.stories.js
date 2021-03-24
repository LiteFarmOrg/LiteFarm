import React from 'react';
import Field from '../../../../components/AreaDetailsLayout/Field';
import decorator from '../../config/decorators';

export default {
  title: 'Components/Area/Field',
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
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
