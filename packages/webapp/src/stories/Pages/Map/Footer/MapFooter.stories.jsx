import { componentDecoratorsWithoutPadding } from '../../config/Decorators';
import PureMapFooter from '../../../../components/Map/Footer/';
import { chromaticSmallScreen } from '../../config/chromatic';
import { MAP_LOCATION_TYPE_BY_FIGURE } from '../../../../containers/Map/constants';

export default {
  title: 'Components/Map/MapFooter',
  component: PureMapFooter,
  decorators: componentDecoratorsWithoutPadding,
};
const availableFilterSettings = MAP_LOCATION_TYPE_BY_FIGURE;
const Template = (args) => <PureMapFooter {...args} isCompactSideMenu={true} />;

export const Admin = Template.bind({});
Admin.args = {
  isAdmin: true,
  showSpotlight: false,
  availableFilterSettings,
};
Admin.parameters = {
  ...chromaticSmallScreen,
};

export const Worker = Template.bind({});
Worker.args = {
  isAdmin: false,
  showSpotlight: false,
  availableFilterSettings,
};
Worker.parameters = {
  ...chromaticSmallScreen,
};
