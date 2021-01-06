import React from 'react';
import ReactSelect from '../../../components/Form/ReactSelect';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
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
