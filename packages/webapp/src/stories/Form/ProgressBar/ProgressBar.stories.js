import React from 'react';
import ProgressBar from '../../../components/Form/ProgressBar';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  decorators: componentDecorators,
};

const Template = (args) => <ProgressBar {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Duration',
  setValue: () => {},
};
