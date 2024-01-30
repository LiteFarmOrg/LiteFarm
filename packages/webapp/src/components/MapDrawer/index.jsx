import { useMemo } from 'react';
import clsx from 'clsx';
import List from '@mui/material/List';
import { Label, Underlined } from '../Typography';
import MapBackground from '../../assets/images/farmMapFilter/MapBackground.svg?react';
import LabelIcon from '../../assets/images/farmMapFilter/Label.svg?react';
import Barn from '../../assets/images/farmMapFilter/Barn.svg?react';
import CeremonialArea from '../../assets/images/farmMapFilter/CA.svg?react';
import FarmSiteBoundary from '../../assets/images/farmMapFilter/FSB.svg?react';
import Field from '../../assets/images/farmMapFilter/Field.svg?react';
import Garden from '../../assets/images/farmMapFilter/Garden.svg?react';
import Greenhouse from '../../assets/images/farmMapFilter/Greenhouse.svg?react';
import SurfaceWater from '../../assets/images/farmMapFilter/SurfaceWater.svg?react';
import NaturalArea from '../../assets/images/farmMapFilter/NA.svg?react';
import Residence from '../../assets/images/farmMapFilter/Residence.svg?react';
import BufferZone from '../../assets/images/farmMapFilter/BufferZone.svg?react';
import Watercourse from '../../assets/images/farmMapFilter/Creek.svg?react';
import Fence from '../../assets/images/farmMapFilter/Fence.svg?react';
import Gate from '../../assets/images/farmMapFilter/Gate.svg?react';
import WaterValve from '../../assets/images/farmMapFilter/WaterValve.svg?react';
import Sensor from '../../assets/images/farmMapFilter/Sensor.svg?react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { locationEnum } from '../../containers/Map/constants';
import MapDrawerMenuItem from './MapDrawerMenuItem';
import Drawer from '../Drawer';
import styles from './styles.module.scss';

export default function MapDrawer({
  showMapDrawer,
  setShowMapDrawer,
  onMenuItemClick,
  filterSettings,
  availableFilterSettings,
  headerTitle,
}) {
  const { t } = useTranslation();

  const areaImgDict = useMemo(
    () =>
      [
        {
          name: t('FARM_MAP.MAP_FILTER.BARN'),
          icon: () => <Barn />,
          key: locationEnum.barn,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.CA'),
          icon: () => <CeremonialArea />,
          key: locationEnum.ceremonial_area,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.FSB'),
          icon: () => <FarmSiteBoundary />,
          key: locationEnum.farm_site_boundary,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.FIELD'),
          icon: () => <Field />,
          key: locationEnum.field,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.GARDEN'),
          icon: () => <Garden />,
          key: locationEnum.garden,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.GREENHOUSE'),
          icon: () => <Greenhouse />,
          key: locationEnum.greenhouse,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.SURFACE_WATER'),
          icon: () => <SurfaceWater />,
          key: locationEnum.surface_water,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.NA'),
          icon: () => <NaturalArea />,
          key: locationEnum.natural_area,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.RESIDENCE'),
          icon: () => <Residence />,
          key: locationEnum.residence,
        },
      ]
        .sort((firstLocationType, secondLocationType) =>
          firstLocationType.name.localeCompare(secondLocationType.name),
        )
        .filter(
          ({ key }) => !availableFilterSettings || availableFilterSettings.area.includes(key),
        ),
    [availableFilterSettings?.area],
  );

  const lineImgDict = useMemo(
    () =>
      [
        {
          name: t('FARM_MAP.MAP_FILTER.BZ'),
          icon: () => <BufferZone />,
          key: locationEnum.buffer_zone,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.WATERCOURSE'),
          icon: () => <Watercourse />,
          key: locationEnum.watercourse,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.FENCE'),
          icon: () => <Fence />,
          key: locationEnum.fence,
        },
      ]
        .sort((firstLocationType, secondLocationType) =>
          firstLocationType.name.localeCompare(secondLocationType.name),
        )
        .filter(
          ({ key }) => !availableFilterSettings || availableFilterSettings.line.includes(key),
        ),
    [availableFilterSettings?.line],
  );

  const pointImgDict = useMemo(
    () =>
      [
        {
          name: t('FARM_MAP.MAP_FILTER.GATE'),
          icon: () => <Gate />,
          key: locationEnum.gate,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.WV'),
          icon: () => <WaterValve />,
          key: locationEnum.water_valve,
        },
        {
          name: t('FARM_MAP.MAP_FILTER.SENSOR'),
          icon: () => <Sensor style={{ transform: 'translate(-5px, 5px)' }} />,
          key: locationEnum.sensor,
        },
      ]
        .sort((firstLocationType, secondLocationType) =>
          firstLocationType.name.localeCompare(secondLocationType.name),
        )
        .filter(
          ({ key }) => !availableFilterSettings || availableFilterSettings.point.includes(key),
        ),
    [availableFilterSettings?.point],
  );

  const list = () => (
    <div role="presentation">
      <div className={styles.headerContentContainer}>
        {!!filterSettings && (
          <div className={styles.headerTextContainer}>
            <Underlined
              onClick={() => {
                onMenuItemClick('show_all');
              }}
              className={styles.underlined}
            >
              {t('FARM_MAP.MAP_FILTER.SHOW_ALL')}
            </Underlined>
            <span className={styles.verticalDivider} />
            <Underlined
              onClick={() => {
                onMenuItemClick('hide_all');
              }}
              className={styles.underlined}
            >
              {t('FARM_MAP.MAP_FILTER.HIDE_ALL')}
            </Underlined>
          </div>
        )}
      </div>

      <List>
        {!!filterSettings && (
          <MapDrawerMenuItem
            isFilterMenuItem={!!filterSettings}
            name={t('FARM_MAP.MAP_FILTER.SATELLITE')}
            onClick={() => onMenuItemClick('map_background')}
            isFiltered={!filterSettings['map_background']}
          >
            <MapBackground />
          </MapDrawerMenuItem>
        )}

        {!!filterSettings && !!areaImgDict.length && (
          <MapDrawerMenuItem
            isFilterMenuItem={!!filterSettings}
            name={t('FARM_MAP.MAP_FILTER.LABEL')}
            onClick={() => onMenuItemClick('label')}
            isFiltered={!filterSettings['label']}
          >
            <LabelIcon />
          </MapDrawerMenuItem>
        )}

        {!!areaImgDict.length && (
          <Label className={styles.label}>
            {t('FARM_MAP.MAP_FILTER.AREAS')}
            <span className={styles.labelDivider} />
          </Label>
        )}
        {areaImgDict.map(({ key, name, icon }) => {
          return (
            <MapDrawerMenuItem
              key={key}
              name={name}
              isFilterMenuItem={!!filterSettings}
              onClick={() => onMenuItemClick(key)}
              isFiltered={filterSettings && !filterSettings?.[key]}
            >
              {icon()}
            </MapDrawerMenuItem>
          );
        })}

        {!!lineImgDict.length && (
          <Label className={styles.label}>
            {t('FARM_MAP.MAP_FILTER.LINES')}
            <span className={styles.labelDivider} />
          </Label>
        )}
        {lineImgDict.map(({ key, name, icon }) => (
          <MapDrawerMenuItem
            key={key}
            name={name}
            isFilterMenuItem={!!filterSettings}
            onClick={() => onMenuItemClick(key)}
            isFiltered={filterSettings && !filterSettings?.[key]}
          >
            {icon()}
          </MapDrawerMenuItem>
        ))}

        {!!pointImgDict.length && (
          <Label className={styles.label}>
            {t('FARM_MAP.MAP_FILTER.POINTS')}
            <span className={styles.labelDivider} />
          </Label>
        )}
        {pointImgDict.map(({ key, name, icon }) => (
          <MapDrawerMenuItem
            key={key}
            name={name}
            isFilterMenuItem={!!filterSettings}
            onClick={() => onMenuItemClick(key)}
            isFiltered={filterSettings && !filterSettings?.[key]}
          >
            {icon()}
          </MapDrawerMenuItem>
        ))}
      </List>
    </div>
  );

  return (
    <div>
      <Drawer
        data-cy="map-drawer"
        title={headerTitle}
        isOpen={showMapDrawer}
        onClose={() => setShowMapDrawer(false)}
      >
        {list()}
      </Drawer>
    </div>
  );
}

MapDrawer.prototype = {
  showMapDrawer: PropTypes.bool,
  setShowMapDrawer: PropTypes.func,
  onMenuItemClick: PropTypes.func,
  drawerDefaultHeight: PropTypes.number,
  filterSettings: PropTypes.object,
  headerTitle: PropTypes.string,
  availableFilterSettings: PropTypes.shape({
    area: PropTypes.array,
    point: PropTypes.array,
    line: PropTypes.array,
  }),
};
