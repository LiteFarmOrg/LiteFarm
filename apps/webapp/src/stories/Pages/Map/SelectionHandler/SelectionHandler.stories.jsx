import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/Decorators';
import PureSelectionHandler from '../../../../components/Map/SelectionHandler';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Components/Map/LocationSelection',
  component: PureSelectionHandler,
  decorators: componentDecoratorsWithoutPadding,
};

const locations = [
  {
    asset: 'line',
    id: '80ca2d14-9636-11eb-93d7-acde48001122',
    name: 'Fence 1',
    type: 'fence',
  },
];

const Template = (args) => <PureSelectionHandler {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  locations: locations,
  history: () => {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
