import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/decorators';
import PureSelectionHandler from '../../../../components/Map/SelectionHandler';
import { locationEnum } from '../../../../containers/Map/constants';

export default {
  title: 'Components/Map/LocationSelection',
  component: PureSelectionHandler,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <PureSelectionHandler {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  locationAssetType: 'Point',
  locationType: locationEnum.gate,
  locationName: 'Gate 1',
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
