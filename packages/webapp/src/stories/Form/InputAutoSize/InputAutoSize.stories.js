import React from 'react';
import InputAutoSize from '../../../components/Form/InputAutoSize';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/InputAutoSize',
  component: InputAutoSize,
  decorators: componentDecorators,
};

const Template = (args) => <InputAutoSize {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  label: 'label',
  defaultValue:
    'long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long ',
  rowsMax: 4,
};

export const Empty = Template.bind({});
Empty.args = {
  label: 'label',
  rowsMax: 4,
};
