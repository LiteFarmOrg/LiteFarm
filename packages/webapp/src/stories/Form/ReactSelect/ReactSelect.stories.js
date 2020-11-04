import React from 'react';
import { styles } from '../../../components/Form/ReactSelect';
import Select from 'react-select';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
]

export default {
  title: 'Components/ReactSelect',
  component: Select,
  decorators: [story => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <Select {...args} />;

export const Default = Template.bind({});
Default.args = {
  options: options,
  styles: styles,
};


