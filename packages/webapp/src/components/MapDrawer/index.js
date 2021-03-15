import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import { Label, Semibold, Underlined } from '../Typography';
import { ReactComponent as MapBackground } from '../../assets/images/farmMapFilter/MapBackground.svg';
import { ReactComponent as Barn } from '../../assets/images/farmMapFilter/Barn.svg';
import { ReactComponent as CeremonialArea } from '../../assets/images/farmMapFilter/CA.svg';
import { ReactComponent as FarmSiteBoundary } from '../../assets/images/farmMapFilter/FSB.svg';
import { ReactComponent as Field } from '../../assets/images/farmMapFilter/Field.svg';
import { ReactComponent as Greenhouse } from '../../assets/images/farmMapFilter/Greenhouse.svg';
import { ReactComponent as Groundwater } from '../../assets/images/farmMapFilter/Groundwater.svg';
import { ReactComponent as NaturalArea } from '../../assets/images/farmMapFilter/NA.svg';
import { ReactComponent as Residence } from '../../assets/images/farmMapFilter/Residence.svg';
import { ReactComponent as BufferZone } from '../../assets/images/farmMapFilter/BufferZone.svg';
import { ReactComponent as Creek } from '../../assets/images/farmMapFilter/Creek.svg';
import { ReactComponent as Fence } from '../../assets/images/farmMapFilter/Fence.svg';
import { ReactComponent as Gate } from '../../assets/images/farmMapFilter/Gate.svg';
import { ReactComponent as WaterValve } from '../../assets/images/farmMapFilter/WaterValve.svg';
import { Drawer } from '@material-ui/core';
import { colors } from '../../assets/theme';
import { useTranslation } from 'react-i18next';
import { motion, useAnimation } from 'framer-motion';
import PropTypes from 'prop-types';
import { locationEnum } from '../../containers/Map/constants';
import MapDrawerMenuItem from './MapDrawerMenuItem';

const useStyles = makeStyles({
  fullList: {
    width: 'auto',
    marginBottom: '60px',
    elevation: 0,
    backgroundColor: 'white',
    borderRadius: '16px 16px 0px 0px',
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.25)',
  },
  greenbar: {
    height: '4px',
    width: '36px',
    backgroundColor: colors.teal700,
    borderRadius: '2px',
  },
  handleBarContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '14px 0',
  },
  MuiDrawer: {
    backgroundColor: colors.teal700,
  },
  BackdropProps: {
    background: 'transparent',
  },
  header: {
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    'touch-action': 'none',
  },
  headerTitle: {
    marginBottom: '16px',
  },
  headerContentContainer: {
    padding: '0 24px 8px 24px',
  },
  headerTextContainer: {
    textDecoration: 'underline',
    display: 'flex',
    flexDirection: 'row',
  },
  icon: {},
  underlined: {
    color: colors.brown700,
  },
  verticalDivider: {
    borderLeft: '1px solid',
    margin: '0 8px',
    color: colors.grey400,
  },
  label: {
    marginLeft: '24px',
    height: '24px',
  },
  labelDivider: {
    display: 'inline-block',
    borderTop: '1px solid',
    width: 'calc(100% - 80px)',
    transform: 'translate(11px, -3px)',
    color: '#C4C4C4',
  },
});

export default function MapDrawer({
  showMapDrawer,
  setShowMapDrawer,
  onMenuItemClick,
  filterSettings,
  availableFilterSettings,
  drawerDefaultHeight = window.innerHeight / 2 - 156,
  headerTitle,
}) {
  const { t } = useTranslation();

  const classes = useStyles();

  let areaImgDict = [
    {
      name: t('FARM_MAP.MAP_FILTER.BARN'),
      icon: () => <Barn className={classes.icon} />,
      key: locationEnum.barn,
    },
    {
      name: t('FARM_MAP.MAP_FILTER.CA'),
      icon: () => <CeremonialArea className={classes.icon} />,
      key: locationEnum.ceremonial_area,
    },
    {
      name: t('FARM_MAP.MAP_FILTER.FSB'),
      icon: () => <FarmSiteBoundary className={classes.icon} />,
      key: locationEnum.farm_bound,
    },
    {
      name: t('FARM_MAP.MAP_FILTER.FIELD'),
      icon: () => <Field className={classes.icon} />,
      key: locationEnum.field,
    },
    {
      name: t('FARM_MAP.MAP_FILTER.GREENHOUSE'),
      icon: () => <Greenhouse className={classes.icon} />,
      key: locationEnum.greenhouse,
    },
    {
      name: t('FARM_MAP.MAP_FILTER.GROUNDWATER'),
      icon: () => <Groundwater className={classes.icon} />,
      key: locationEnum.ground_water,
    },
    {
      name: t('FARM_MAP.MAP_FILTER.NA'),
      icon: () => <NaturalArea className={classes.icon} />,
      key: locationEnum.natural_area,
    },
    {
      name: t('FARM_MAP.MAP_FILTER.RESIDENCE'),
      icon: () => <Residence className={classes.icon} />,
      key: locationEnum.residence,
    },
  ];

  let lineImgDict = [
    {
      name: t('FARM_MAP.MAP_FILTER.BZ'),
      icon: () => <BufferZone className={classes.icon} />,
      key: locationEnum.buffer_zone,
    },
    {
      name: t('FARM_MAP.MAP_FILTER.CREEK'),
      icon: () => <Creek className={classes.icon} />,
      key: locationEnum.creek,
    },
    {
      name: t('FARM_MAP.MAP_FILTER.FENCE'),
      icon: () => <Fence className={classes.icon} />,
      key: locationEnum.fence,
    },
  ];

  let pointImgDict = [
    {
      name: t('FARM_MAP.MAP_FILTER.GATE'),
      icon: () => <Gate className={classes.icon} />,
      key: locationEnum.gate,
    },
    {
      name: t('FARM_MAP.MAP_FILTER.WV'),
      icon: () => <WaterValve className={classes.icon} />,
      key: locationEnum.water_valve,
    },
  ];

  if (availableFilterSettings) {
    areaImgDict = areaImgDict.filter(({ key }) => availableFilterSettings.area.includes(key));
    lineImgDict = lineImgDict.filter(({ key }) => availableFilterSettings.line.includes(key));
    pointImgDict = pointImgDict.filter(({ key }) => availableFilterSettings.point.includes(key));
  }

  const [initHeight, setInitHeight] = useState(drawerDefaultHeight);
  const controls = useAnimation();
  const onPan = (event, info) =>
    controls.start({
      height: window.innerHeight - info.point.y - 142,
    });
  const onPanEnd = (event, info) => {
    if (info.point.y > window.innerHeight / 2 + 156) {
      setShowMapDrawer(false);
    } else if (info.point.y < 156) {
      const newHeight = window.innerHeight - 156;
      controls.start({
        height: newHeight,
      });
      setInitHeight(newHeight);
    } else {
      setInitHeight(window.innerHeight - info.point.y - 60);
    }
  };

  const list = () => (
    <div className={clsx(classes.fullList)} role="presentation">
      <motion.div className={classes.header} onPan={onPan} onPanEnd={onPanEnd}>
        <HandleBar classes={classes} />

        <div className={classes.headerContentContainer}>
          <Semibold className={classes.headerTitle}>{headerTitle}</Semibold>
          {!!filterSettings && (
            <div className={classes.headerTextContainer}>
              <Underlined
                onClick={() => {
                  onMenuItemClick('show_all');
                }}
                className={classes.underlined}
              >
                {t('FARM_MAP.MAP_FILTER.SHOW_ALL')}
              </Underlined>
              <span className={classes.verticalDivider} />
              <Underlined
                onClick={() => {
                  onMenuItemClick('hide_all');
                }}
                className={classes.underlined}
              >
                {t('FARM_MAP.MAP_FILTER.HIDE_ALL')}
              </Underlined>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div style={{ overflowY: 'scroll', height: initHeight }} animate={controls}>
        <List>
          {!!filterSettings && (
            <MapDrawerMenuItem
              isFilterMenuItem={!!filterSettings}
              name={t('FARM_MAP.MAP_FILTER.SATELLITE')}
              onClick={() => onMenuItemClick('map_background')}
              isFiltered={!filterSettings['map_background']}
            >
              <MapBackground className={classes.icon} />
            </MapDrawerMenuItem>
          )}

          {!!areaImgDict.length && (
            <Label className={classes.label}>
              {t('FARM_MAP.MAP_FILTER.AREAS')}
              <span className={classes.labelDivider} />
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
            <Label className={classes.label}>
              {t('FARM_MAP.MAP_FILTER.LINES')}
              <span className={classes.labelDivider} />
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
            <Label className={classes.label}>
              {t('FARM_MAP.MAP_FILTER.POINTS')}
              <span className={classes.labelDivider} />
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
      </motion.div>
      <Divider />
    </div>
  );

  return (
    <div>
      <Drawer
        anchor={'bottom'}
        open={showMapDrawer}
        onClose={() => setShowMapDrawer(false)}
        PaperProps={{
          style: { backgroundColor: 'transparent' },
          square: false,
        }}
        ModalProps={{
          classes: { paddingBottom: '20px' },
          BackdropProps: {
            classes: {
              root: classes.BackdropProps,
            },
          },
        }}
      >
        {list()}
      </Drawer>
    </div>
  );
}

function HandleBar({ classes }) {
  return (
    <div className={classes.handleBarContainer}>
      <div className={classes.greenbar} />
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
