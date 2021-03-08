import React from 'react';
import TitleLayout from '../../components/Layout/TitleLayout';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Layout/TitleLayout',
  decorators: componentDecorators,
  component: TitleLayout,
};

const Template = (args) => <TitleLayout {...args} />;

export const Primary = Template.bind({});
Primary.args = { title: 'Dummy header' };
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
