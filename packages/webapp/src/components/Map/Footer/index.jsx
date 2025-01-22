import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import MapDrawer from '../../MapDrawer';
import { locationEnum } from '../../../containers/Map/constants';
import { TourProviderWrapper } from '../../TourProviderWrapper/TourProviderWrapper';
import FloatingContainer from '../../FloatingContainer';
import MapNavigationButtons from './MapNavigationButtons';

export default function PureMapFooter({
  isAdmin,
  showSpotlight,
  resetSpotlight,
  onClickAdd,
  showModal,
  onClickExport,
  handleClickFilter,
  setShowMapFilter,
  showMapFilter,
  setShowAddDrawer,
  showAddDrawer,
  drawerDefaultHeight,
  filterSettings,
  onFilterMenuClick,
  onAddMenuClick,
  availableFilterSettings = {
    area: [
      locationEnum.barn,
      locationEnum.ceremonial_area,
      locationEnum.farm_site_boundary,
      locationEnum.field,
      locationEnum.garden,
      locationEnum.greenhouse,
      locationEnum.surface_water,
      locationEnum.natural_area,
      locationEnum.residence,
    ],
    line: [locationEnum.buffer_zone, locationEnum.watercourse, locationEnum.fence],
    point: [locationEnum.gate, locationEnum.water_valve, locationEnum.sensor],
  },
  isMapFilterSettingActive = false,
  isCompactSideMenu,
}) {
  const { t } = useTranslation();

  return (
    <TourProviderWrapper
      padding={0}
      open={showSpotlight}
      onFinish={resetSpotlight}
      steps={[
        ...(isAdmin
          ? [
              {
                selector: '#mapFirstStep',
                title: t('FARM_MAP.SPOTLIGHT.ADD_TITLE'),
                contents: [t('FARM_MAP.SPOTLIGHT.HERE_YOU_CAN')],
                list: [t('FARM_MAP.SPOTLIGHT.ADD')],
                position: 'center',
              },
            ]
          : []),
        {
          selector: '#mapSecondStep',
          title: t('FARM_MAP.SPOTLIGHT.FILTER_TITLE'),
          contents: [t('FARM_MAP.SPOTLIGHT.HERE_YOU_CAN')],
          list: [t('FARM_MAP.SPOTLIGHT.FILTER')],
          position: 'center',
        },
        {
          selector: '#mapThirdStep',
          title: t('FARM_MAP.SPOTLIGHT.EXPORT_TITLE'),
          contents: [t('FARM_MAP.SPOTLIGHT.HERE_YOU_CAN')],
          list: [t('FARM_MAP.SPOTLIGHT.EXPORT')],
          position: 'center',
        },
      ]}
    >
      {isAdmin && (
        <FloatingContainer isCompactSideMenu={isCompactSideMenu}>
          <MapNavigationButtons
            showAddDrawer={showAddDrawer}
            showMapFilter={showMapFilter}
            showModal={showModal}
            onClickAdd={onClickAdd}
            handleClickFilter={handleClickFilter}
            onClickExport={onClickExport}
            isMapFilterSettingActive={isMapFilterSettingActive}
          />
        </FloatingContainer>
      )}
      <MapDrawer
        key={'filter'}
        setShowMapDrawer={setShowMapFilter}
        showMapDrawer={showMapFilter}
        drawerDefaultHeight={drawerDefaultHeight}
        headerTitle={t('FARM_MAP.MAP_FILTER.TITLE')}
        filterSettings={filterSettings}
        availableFilterSettings={availableFilterSettings}
        onMenuItemClick={onFilterMenuClick}
      />
      <MapDrawer
        key={'add'}
        setShowMapDrawer={setShowAddDrawer}
        showMapDrawer={!showSpotlight && showAddDrawer}
        drawerDefaultHeight={window.innerHeight - 156}
        headerTitle={t('FARM_MAP.MAP_FILTER.ADD_TITLE')}
        onMenuItemClick={onAddMenuClick}
      />
    </TourProviderWrapper>
  );
}

PureMapFooter.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
  isAdmin: PropTypes.bool,
  showSpotlight: PropTypes.bool,
  resetSpotlight: PropTypes.func,
  onClickAdd: PropTypes.func,
  onClickFilter: PropTypes.func,
  showModal: PropTypes.bool,
  onClickExport: PropTypes.func,
  setShowMapFilter: PropTypes.func,
  showMapFilter: PropTypes.bool,
  drawerDefaultHeight: PropTypes.number,
  filterSettings: PropTypes.func,
  onFilterMenuClick: PropTypes.func,
  onAddMenuClick: PropTypes.func,
  setShowAddDrawer: PropTypes.func,
  availableFilterSettings: PropTypes.shape({
    area: PropTypes.array,
    point: PropTypes.array,
    line: PropTypes.array,
  }),
  isMapFilterSettingActive: PropTypes.bool,
};
