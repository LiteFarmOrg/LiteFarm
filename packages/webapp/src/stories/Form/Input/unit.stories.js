import React from 'react';
import Input from '../../../components/Form/Unit';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/Unit',
  component: Input,
  decorators: componentDecorators,
};
const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
  { label: 'Sand', value: 'sand' },
  { label: 'Loamy Sand', value: 'loamySand' },
  { label: 'Sandy Loam', value: 'sandyLoam' },
  { label: 'Loam', value: 'loam' },
  { label: 'Silt Loam', value: 'siltLoam' },
  { label: 'Silt', value: 'silt' },
  { label: 'Sandy Clay Loam', value: 'sandyClayLoam' },
  { label: 'Clay Loam', value: 'clayLoam' },
  { label: 'Silty Clay Loam', value: 'siltyClayLoam' },
  { label: 'Sandy Clay', value: 'sandyClay' },
  { label: 'Silty Clay', value: 'siltyClay' },
  { label: 'Clay', value: 'clay' },
  { label: '0-5cm', value: 5 },
  { label: '0-10cm', value: 10 },
  { label: '0-20cm', value: 20 },
  { label: '21-30cm', value: 30 },
  { label: '30-50cm', value: 50 },
  { label: '51-100cm', value: 100 },
];
const Template = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'default',
  options,
};
