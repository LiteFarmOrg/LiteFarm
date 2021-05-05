import React from 'react';
import Pill from '../../components/Filter/Pill';

export default {
  title: 'Components/FilterPill',
  component: Pill,
};

const Template = (args) => <Pill {...args} />;

export const Selected = Template.bind({});
Selected.args = {
  item: 'Active',
  selected: true,
};

export const Deselected = Template.bind({});
Deselected.args = {
  item: 'Active',
  selected: false,
};

export const Removable = Template.bind({});
Removable.args = {
  item: 'Active',
  selected: true,
  removable: true,
};
