import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/Decorators';
import PureMapHeader from '../../../../components/Map/Header/';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Components/Map/MapHeader',
  component: PureMapHeader,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <PureMapHeader {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  farmName: 'Happy Valley',
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const AdminMapHeader = Template.bind({});

AdminMapHeader.args = {
  farmName: 'Happy Valley',
  isAdmin: true,
  handleVideoClick: () => {},
};
AdminMapHeader.parameters = {
  ...chromaticSmallScreen,
};

export const MapHeaderWithClose = Template.bind({});

MapHeaderWithClose.args = {
  farmName: 'Happy Valley',
  handleClose: () => {},
};
MapHeaderWithClose.parameters = {
  ...chromaticSmallScreen,
};
