import React from 'react';
import TitleLayout from '../../components/Layout/TitleLayout';
import decorator from '../Pages/config/decorators';

export default {
  title: 'Layout/TitleLayoutWithCancel',
  decorators: decorator,
  component: TitleLayout,
};

const Template = (args) => <TitleLayout {...args} />;

export const Primary = Template.bind({});
Primary.args = { title: 'Dummy header', onCancel: true };
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
