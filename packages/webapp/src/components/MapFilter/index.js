import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Semibold } from '../Typography';
import MapBackground from '../../assets/images/farmMapFilter/MapBackground.svg';
import Barn from '../../assets/images/farmMapFilter/Barn.svg';
import CeremonialArea from '../../assets/images/farmMapFilter/CA.svg';
import FarmSiteBoundary from '../../assets/images/farmMapFilter/FSB.svg';
import Field from '../../assets/images/farmMapFilter/Field.svg';
import Greenhouse from '../../assets/images/farmMapFilter/Greenhouse.svg';
import Groundwater from '../../assets/images/farmMapFilter/Groundwater.svg';
import NaturalArea from '../../assets/images/farmMapFilter/NA.svg';
import BufferZone from '../../assets/images/farmMapFilter/BufferZone.svg';
import Creek from '../../assets/images/farmMapFilter/Creek.svg';
import Fence from '../../assets/images/farmMapFilter/Fence.svg';
import Gate from '../../assets/images/farmMapFilter/Gate.svg';
import WaterValve from '../../assets/images/farmMapFilter/WaterValve.svg';
import Rectangle from '../../assets/images/farmMapFilter/Rectangle.svg';
import Leaf from '../../assets/images/farmMapFilter/Leaf.svg';
import Line from '../../assets/images/farmMapFilter/Line.svg';
import { MdVisibility, MdVisibilityOff } from 'react-icons/all';
import { Box, Drawer } from '@material-ui/core';
import { colors } from '../../assets/theme';
import { useTranslation } from 'react-i18next';
import { motion, useAnimation } from 'framer-motion';
import PropTypes from 'prop-types';
import { locationEnum } from '../../containers/Map/constants';

const useStyles = makeStyles({
  fullList: {
    width: 'auto',
    marginBottom: '60px',
  },
  greenbar: {
    height: '4px',
    width: '36px',
    backgroundColor: colors.teal700,
    borderRadius: '2px',
    marginTop: '16px',
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
});

export default function MapFilter({
  setRoadview,
  showMapFilter,
  setShowMapFilter,
  onMenuItemClick,
  drawerDefaultHeight = window.innerHeight / 2 - 156,
}) {
  const { t } = useTranslation();

  const classes = useStyles();
  const mapText = t('FARM_MAP.MAP_FILTER.SATELLITE');

  const areaImgDict = [
    { name: t('FARM_MAP.MAP_FILTER.BARN'), img: Barn, key: locationEnum.barn },
    { name: t('FARM_MAP.MAP_FILTER.CA'), img: CeremonialArea, key: locationEnum.ceremonial_area },
    { name: t('FARM_MAP.MAP_FILTER.FSB'), img: FarmSiteBoundary, key: locationEnum.farmBound },
    { name: t('FARM_MAP.MAP_FILTER.FIELD'), img: Field, key: locationEnum.field },
    { name: t('FARM_MAP.MAP_FILTER.GREENHOUSE'), img: Greenhouse, key: locationEnum.greenhouse },
    {
      name: t('FARM_MAP.MAP_FILTER.GROUNDWATER'),
      img: Groundwater,
      key: locationEnum.ground_water,
    },
    { name: t('FARM_MAP.MAP_FILTER.NA'), img: NaturalArea, key: locationEnum.natural_area },
  ];

  const lineImgDict = [
    { name: t('FARM_MAP.MAP_FILTER.BZ'), img: BufferZone, key: locationEnum.buffer_zone },
    { name: t('FARM_MAP.MAP_FILTER.CREEK'), img: Creek, key: locationEnum.creek },
    { name: t('FARM_MAP.MAP_FILTER.FENCE'), img: Fence, key: locationEnum.fence },
  ];

  const pointImgDict = [
    { name: t('FARM_MAP.MAP_FILTER.GATE'), img: Gate, key: locationEnum.gate },
    { name: t('FARM_MAP.MAP_FILTER.WV'), img: WaterValve, key: locationEnum.water_valve },
  ];

  const setAllVisibilityOff = () => {
    selected.push('Satellite background');
  };
  const [initHeight, setInitHeight] = useState(drawerDefaultHeight);
  const controls = useAnimation();
  const onPan = (event, info) =>
    controls.start({
      height: window.innerHeight - info.point.y - 60,
    });
  const onPanEnd = (event, info) => {
    if (info.point.y > window.innerHeight / 2 + 156) {
      setShowMapFilter(false);
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
    <div className={clsx(classes.list, classes.fullList)} role="presentation">
      <div
        style={{
          elevation: 0,
          backgroundColor: 'white',
          borderRadius: '16px 16px 0px 0px',
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        <motion.div
          style={{ height: '90px' }}
          className={classes.header}
          onPan={onPan}
          onPanEnd={onPanEnd}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              padding: '4px 0',
            }}
          >
            <div className={classes.greenbar} />
          </div>
          <div style={{ marginLeft: '24px', paddingTop: '10px' }}>
            <Semibold>{t('FARM_MAP.MAP_FILTER.TITLE')}</Semibold>
            <div
              style={{
                textDecoration: 'underline',
                color: '#AA5F04',
                fontSize: '14px',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <div
                onClick={() => {
                  setAllVisibility();
                  setRoadview(false);
                }}
              >
                <p>
                  {t('FARM_MAP.MAP_FILTER.SHOW_ALL')}
                  <img style={{ paddingLeft: '6px', paddingRight: '6px' }} src={Line} />{' '}
                </p>
              </div>
              <div
                onClick={() => {
                  setAllVisibilityOff();
                  setRoadview(true);
                }}
              >
                <p>{t('FARM_MAP.MAP_FILTER.HIDE_ALL')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div style={{ overflowY: 'scroll', height: initHeight }} animate={controls}>
          <List>
            {
              <ListItem
                style={
                  selected.includes(mapText)
                    ? { backgroundColor: '#F3F6FB' }
                    : { backgroundColor: 'white' }
                }
                button
                key={mapText}
              >
                <ListItemIcon>
                  {<img src={MapBackground} style={{ paddingLeft: '20px' }} />}{' '}
                </ListItemIcon>

                <ListItemText primary={mapText} />
                <div style={{ paddingRight: '24px' }}>
                  {visibility || selected.includes(mapText) ? (
                    <MdVisibilityOff
                      size={24}
                      color={'#66738A'}
                      onClick={() => {
                        selectOrDeselect(mapText);
                        setRoadview(false);
                      }}
                    />
                  ) : (
                    <MdVisibility
                      size={24}
                      color={'#66738A'}
                      onClick={() => {
                        selectOrDeselect(mapText);
                        setRoadview(true);
                      }}
                    />
                  )}
                </div>
              </ListItem>
            }
            <div
              style={{
                marginLeft: '24px',
                color: '#66738A',
                fontSize: '14px',
                fontWeight: '600',
                paddingTop: '10px',
              }}
            >
              <p>
                {t('FARM_MAP.MAP_FILTER.AREAS')}{' '}
                <img src={Rectangle} style={{ paddingLeft: '6px', marginRight: '24px' }} />{' '}
              </p>
            </div>
            {areaImgDict.map((item) => (
              <ListItem
                style={
                  selected.includes(item.name)
                    ? { backgroundColor: '#F3F6FB' }
                    : { backgroundColor: 'white' }
                }
                button
                key={item.name}
              >
                <ListItemIcon>
                  {<img src={item.img} style={{ paddingLeft: '20px' }} />}
                </ListItemIcon>
                <Box style={{ paddingRight: '5px' }}>{item.name}</Box>
                {item.name === t('FARM_MAP.MAP_FILTER.FSB') ? (
                  <ListItemText
                    secondaryTypographyProps={{ align: 'left' }}
                    secondary={<img src={Leaf} />}
                  />
                ) : (
                  <ListItemText />
                )}
                <div style={{ paddingRight: '24px' }}>
                  {visibility || selected.includes(item.name) ? (
                    <MdVisibilityOff
                      size={24}
                      color={'#66738A'}
                      onClick={() => selectOrDeselect(item.name)}
                    />
                  ) : (
                    <MdVisibility
                      size={24}
                      color={'#66738A'}
                      onClick={() => selectOrDeselect(item.name)}
                    />
                  )}
                </div>
              </ListItem>
            ))}
            <div
              style={{
                marginLeft: '24px',
                color: '#66738A',
                fontSize: '14px',
                fontWeight: '600',
                paddingTop: '10px',
              }}
            >
              <p>
                {t('FARM_MAP.MAP_FILTER.LINES')}{' '}
                <img src={Rectangle} style={{ paddingLeft: '6px', marginRight: '24px' }} />{' '}
              </p>
            </div>
            {lineImgDict.map((item) => (
              <ListItem
                style={
                  selected.includes(item.name)
                    ? { backgroundColor: '#F3F6FB' }
                    : { backgroundColor: 'white' }
                }
                button
                key={item.name}
              >
                <ListItemIcon>
                  {<img src={item.img} style={{ paddingLeft: '20px' }} />}
                </ListItemIcon>
                <ListItemText primary={item.name} />
                <div style={{ paddingRight: '24px' }}>
                  {visibility || selected.includes(item.name) ? (
                    <MdVisibilityOff
                      size={24}
                      color={'#66738A'}
                      onClick={() => selectOrDeselect(item.name)}
                    />
                  ) : (
                    <MdVisibility
                      size={24}
                      color={'#66738A'}
                      onClick={() => selectOrDeselect(item.name)}
                    />
                  )}
                </div>
              </ListItem>
            ))}
            <div
              style={{
                marginLeft: '24px',
                color: '#66738A',
                fontSize: '14px',
                fontWeight: '600',
                paddingTop: '10px',
              }}
            >
              <p>
                {t('FARM_MAP.MAP_FILTER.POINTS')}{' '}
                <img src={Rectangle} style={{ paddingLeft: '6px', marginRight: '24px' }} />{' '}
              </p>
            </div>
            {pointImgDict.map((item) => (
              <ListItem
                style={
                  selected.includes(item.name)
                    ? { backgroundColor: '#F3F6FB' }
                    : { backgroundColor: 'white' }
                }
                button
                key={item.name}
              >
                <ListItemIcon>
                  {<img src={item.img} style={{ paddingLeft: '20px' }} />}
                </ListItemIcon>
                <ListItemText primary={item.name} />
                <div style={{ paddingRight: '24px' }}>
                  {visibility || selected.includes(item.name) ? (
                    <MdVisibilityOff
                      size={24}
                      color={'#66738A'}
                      onClick={() => selectOrDeselect(item.name)}
                    />
                  ) : (
                    <MdVisibility
                      size={24}
                      color={'#66738A'}
                      onClick={() => selectOrDeselect(item.name)}
                    />
                  )}
                </div>
              </ListItem>
            ))}
          </List>
        </motion.div>
      </div>
      <Divider />
    </div>
  );

  return (
    <div>
      <Drawer
        anchor={'bottom'}
        open={showMapFilter}
        onClose={() => setShowMapFilter(false)}
        onOpen={() => setShowMapFilter(true)}
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

MapFilter.prototype = {
  setRoadview: PropTypes.func,
  showMapFilter: PropTypes.bool,
  setShowMapFilter: PropTypes.func,
  onMenuItemClick: PropTypes.func,
  drawerDefaultHeight: PropTypes.number,
};
