import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';

export default {
  title: 'Components/PureSearchbarAndFilter',
  component: PureSearchbarAndFilter,
  decorators: componentDecorators,
};

const Template = (args) => <PureSearchbarAndFilter {...args} />;
export const InActive = Template.bind({});
InActive.args = {};

export const Active = Template.bind({});
Active.args = {
  filterOptions: ['Active', 'Planned', 'Complete', 'Abandoned', 'Needs Plan'],
};
