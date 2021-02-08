import React from 'react';
import ReactSelect from '../../../components/Form/ReactSelect';

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

export default {
  title: 'Components/ReactSelect',
  component: ReactSelect,
  decorators: [(story) => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => (
  <>
    <ReactSelect {...args} />
  </>
);

export const Default = Template.bind({});
Default.args = {
  options: options,
  label: 'label',
  placeholder: 'placeholder',
  defaultMenuIsOpen: true,
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  options: options,
  label: 'label',
  placeholder: 'placeholder',
  defaultMenuIsOpen: true,
  toolTipContent:
    'Gender information is collected for research purposes only and will only be shared with  personally identifying information removed',
};

export const Multi = Template.bind({});
Multi.args = {
  options: options,
  label: 'label',
  placeholder: 'placeholder',
  defaultMenuIsOpen: true,
  isMulti: true,
};
