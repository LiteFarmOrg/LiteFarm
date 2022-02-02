import React from 'react';
import decorators from '../config/Decorators';
import PureChooseFarmScreen from '../../../components/ChooseFarm';
import {
  Active,
  Secondary,
  SecondaryWithoutOwnerName,
} from '../../MenuItem/ChooseFarmMenuItem.stories';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Page/PureChooseFarmScreen',
  decorators: decorators,
  component: PureChooseFarmScreen,
};

const farms = [Secondary.args, SecondaryWithoutOwnerName.args];

const Template = (args) => <PureChooseFarmScreen {...args} />;

export const NotSearchable = Template.bind({});
NotSearchable.args = {
  isOnBoarding: true,
  farms: [Active.args, ...farms],
};
NotSearchable.parameters = {
  ...chromaticSmallScreen,
};

export const Searchable = Template.bind({});
Searchable.args = {
  isOnBoarding: false,
  isSearchable: true,
  farms: [...farms, ...farms, ...farms, Active.args],
};
Searchable.parameters = {
  ...chromaticSmallScreen,
};
