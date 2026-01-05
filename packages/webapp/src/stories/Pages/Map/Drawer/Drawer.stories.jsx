import decorators from '../../config/Decorators';
import PureMapFooter from '../../../../components/Map/Footer/';
import { MAP_LOCATION_TYPE_BY_FIGURE } from '../../../../containers/Map/constants';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Components/Map/Drawer',
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
    <PureMapFooter
      {...args}
      availableFilterSettings={availableFilterSettings}
      isCompactSideMenu={true}
    />
  </div>
);

export const Filter = Template.bind({});
Filter.args = {
  isAdmin: true,
  showSpotlight: false,
  showMapFilter: true,
  drawerDefaultHeight: window.innerHeight - 156,
  /*
   * Map should show barns when barn:true
   * */
  filterSettings: { barn: true },
};
Filter.parameters = {
  ...chromaticSmallScreen,
};

export const Add = Template.bind({});
Add.args = {
  isAdmin: true,
  showSpotlight: false,
  showAddDrawer: true,
  drawerDefaultHeight: window.innerHeight - 156,
};
Filter.parameters = {
  ...chromaticSmallScreen,
};
