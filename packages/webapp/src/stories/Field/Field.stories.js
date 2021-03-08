import React from 'react';
import Field from '../../components/AreaDetails/Field';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Area/Field',
  decorators: componentDecorators,
  component: Field,
};

const Template = (args) => <Field {...args} />;

export const Primary = Template.bind({});
Primary.args = { onGoBack: (data) => console.log(data) };
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
