import React from 'react';
import { PureResetSuccessComponent } from '../../components/Modals/ResetPasswordSuccess';

export default {
  title: 'Components/Modals/PureResetSuccessComponent',
  component: PureResetSuccessComponent,
  decorators: [(story) => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <PureResetSuccessComponent {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
