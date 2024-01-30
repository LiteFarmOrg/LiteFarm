import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import AddLogo from '../../../assets/images/map/add.svg?react';
import FilterLogo from '../../../assets/images/map/filter.svg?react';
import ExportLogo from '../../../assets/images/map/export.svg?react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import MapDrawer from '../../MapDrawer';
import { locationEnum } from '../../../containers/Map/constants';
import { TourProviderWrapper } from '../../TourProviderWrapper/TourProviderWrapper';

export default function PureMapFooter({
  style,
  isAdmin,
  showSpotlight,
  resetSpotlight,
  onClickAdd,
  onClickExport,
  handleClickFilter,
  showModal,
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
}) {
  const { t } = useTranslation();
  const [stepSpotlighted, setStepSpotlighted] = useState(null);

  const { container, button, svg, spotlighted } = styles;
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
      <div className={clsx(container)} style={style}>
        {isAdmin && (
          <button
            data-cy="map-addFeature"
            className={clsx(button, (stepSpotlighted === 0 || showAddDrawer) && spotlighted)}
            id="mapFirstStep"
            onClick={onClickAdd}
          >
            <AddLogo className={svg} />
          </button>
        )}
        <button
          className={clsx(button, (stepSpotlighted === 1 || showMapFilter) && spotlighted)}
          id="mapSecondStep"
          onClick={handleClickFilter}
        >
          {isMapFilterSettingActive && <div className={styles.circle} />}
          <FilterLogo className={svg} />
        </button>
        <button
          className={clsx(button, (stepSpotlighted === 2 || showModal) && spotlighted)}
          id="mapThirdStep"
          onClick={onClickExport}
        >
          <ExportLogo className={svg} />
        </button>
      </div>
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
  onClickExport: PropTypes.func,
  showModal: PropTypes.bool,
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
