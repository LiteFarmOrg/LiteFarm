import React from 'react';
import Field from '../../components/AreaDetails/Field';
import decorator from '../Pages/config/decorators';

export default {
  title: 'Components/Area/Field',
  decorators: decorator,
  component: Field,
};

const Template = (args) => <Field {...args} />;

export const Primary = Template.bind({});
Primary.args = { onGoBack: (data) => console.log(data), title: 'Field', name: 'Field asset name' };
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
