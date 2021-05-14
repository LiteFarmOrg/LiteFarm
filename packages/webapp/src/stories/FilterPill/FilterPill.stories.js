import React from 'react';
import Pill from '../../components/Filter/Pill';

export default {
  title: 'Components/FilterPill',
  component: Pill,
};

const Template = (args) => <Pill {...args} />;

export const Selected = Template.bind({});
Selected.args = {
  label: 'Active',
  selected: true,
};

export const Deselected = Template.bind({});
Deselected.args = {
  label: 'Active',
  selected: false,
};

export const Removable = Template.bind({});
Removable.args = {
  label: 'Active',
  selected: true,
  removable: true,
};
