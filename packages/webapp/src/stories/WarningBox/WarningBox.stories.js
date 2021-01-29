import React from 'react';
import PureWarningBox from '../../components/WarningBox';

export default {
  title: 'Components/WarningBox',
  component: PureWarningBox,
  decorators: [(story) => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <PureWarningBox {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  text:
    "This feature is currently under development and may not be ready this season. However, clicking 'Yes' will turn it on for your farm when it is ready.",
};
