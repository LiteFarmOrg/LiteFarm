import React from 'react';
import CheckBoxPill from '../../components/Filter/CheckBoxPill';

export default {
  title: 'Components/FilterCheckBoxPill',
  component: CheckBoxPill,
};

const Template = (args) => <CheckBoxPill {...args} />;

export const Selected = Template.bind({});
Selected.args = {
  label: 'Active',
  defaultChecked: true,
};

export const Deselected = Template.bind({});
Deselected.args = {
  label: 'Active',
  defaultChecked: false,
};
