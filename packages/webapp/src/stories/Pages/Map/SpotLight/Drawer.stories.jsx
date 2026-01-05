import decorators from '../../config/Decorators';
import PureMapFooter from '../../../../components/Map/Footer/';
import { chromaticSmallScreen } from '../../config/chromatic';
import { MAP_LOCATION_TYPE_BY_FIGURE } from '../../../../containers/Map/constants';

export default {
  title: 'Components/Map/SpotLight',
  component: PureMapFooter,
  decorators: decorators,
};
const availableFilterSettings = MAP_LOCATION_TYPE_BY_FIGURE;
const Template = (args) => (
  <div
    style={{
      display: 'flex',
      flexGrow: 1,
      position: 'absolute',
      flexDirection: 'column',
      width: '100vw',
      height: '100%',
      bottom: 0,
      left: 0,
    }}
  >
    <div style={{ flexGrow: 1 }} />
    <PureMapFooter {...args} isCompactSideMenu={true} />
  </div>
);

export const SpotLight = Template.bind({});
SpotLight.args = {
  isAdmin: true,
  showSpotlight: true,
  availableFilterSettings,
};
SpotLight.parameters = {
  ...chromaticSmallScreen,
};
