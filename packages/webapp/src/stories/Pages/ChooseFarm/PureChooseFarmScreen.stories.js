import React from 'react';
import decorators from '../config/decorators';
import PureChooseFarmScreen from "../../../components/ChooseFarm";
import {Secondary, Active, SecondaryWithoutOwnerName} from "../../ChooseFarmMenuItem/ChooseFarmMenuItem.stories"

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
  farms:[Active.args, ...farms],
};
NotSearchable.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const Searchable = Template.bind({});
Searchable.args = {
  isOnBoarding: false,
  isSearchable: true,
  farms:[...farms,...farms,...farms, Active.args],
};
Searchable.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};