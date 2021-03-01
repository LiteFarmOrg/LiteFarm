import React, { useState, useEffect, useRef } from 'react';
import Joyride, { STATUS, ACTIONS, LIFECYCLE } from 'react-joyride';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { ReactComponent as AddLogo } from '../../../assets/images/map/add.svg';
import { ReactComponent as FilterLogo } from '../../../assets/images/map/filter.svg';
import { ReactComponent as ExportLogo } from '../../../assets/images/map/export.svg';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Semibold } from '../../../components/Typography';
import GreenLine from '../../../assets/images/farmMapFilter/Green_Drawer_Line.svg';
import MapBackground from '../../../assets/images/farmMapFilter/MapBackground.svg';
import Barn from '../../../assets/images/farmMapFilter/Barn.svg';
import CeremonialArea from '../../../assets/images/farmMapFilter/CA.svg';
import FarmSiteBoundary from '../../../assets/images/farmMapFilter/FSB.svg';
import Field from '../../../assets/images/farmMapFilter/Field.svg';
import Greenhouse from '../../../assets/images/farmMapFilter/Greenhouse.svg';
import Groundwater from '../../../assets/images/farmMapFilter/Groundwater.svg';
import NaturalArea from '../../../assets/images/farmMapFilter/NA.svg';
import BufferZone from '../../../assets/images/farmMapFilter/BufferZone.svg';
import Creek from '../../../assets/images/farmMapFilter/Creek.svg';
import Fence from '../../../assets/images/farmMapFilter/Fence.svg';
import Gate from '../../../assets/images/farmMapFilter/Gate.svg';
import WaterValve from '../../../assets/images/farmMapFilter/WaterValve.svg';
import Rectangle from '../../../assets/images/farmMapFilter/Rectangle.svg';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Line from '../../../assets/images/farmMapFilter/Line.svg';
import { MdVisibility, MdVisibilityOff } from 'react-icons/all';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export default function PureMapFooter({
  className,
  style,
  isAdmin,
  showSpotlight,
  resetSpotlight,
  onClickAdd,
  onClickFilter,
  onClickExport,
  showModal,
  setRoadview,
}) {
  const { t } = useTranslation();
  const [stepSpotlighted, setStepSpotlighted] = useState(null);

  const resetSpotlightStatus = (data) => {
    const { action, status, lifecycle } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === ACTIONS.CLOSE) {
      setStepSpotlighted(null);
      resetSpotlight();
    } else if ([ACTIONS.UPDATE].includes(action) && lifecycle === LIFECYCLE.TOOLTIP) {
      setStepSpotlighted(data.index);
    }
  };
  const steps = [
    {
      target: '#mapFirstStep',
      title: TitleContent(t('FARM_MAP.SPOTLIGHT.ADD_TITLE')),
      content: BodyContent(t('FARM_MAP.SPOTLIGHT.ADD')),
      locale: {
        next: NextButtonContent(t('common:NEXT')),
      },
      showCloseButton: false,
      disableBeacon: true,
      placement: 'top-start',
      styles: {
        options: {
          width: 240,
        },
      },
    },
    {
      target: '#mapSecondStep',
      title: TitleContent(t('FARM_MAP.SPOTLIGHT.FILTER_TITLE')),
      content: BodyContent(t('FARM_MAP.SPOTLIGHT.FILTER')),
      locale: {
        next: NextButtonContent(t('common:NEXT')),
      },
      showCloseButton: false,
      placement: 'top-start',
      styles: {
        options: {
          width: 260,
        },
      },
    },
    {
      target: '#mapThirdStep',
      title: TitleContent(t('FARM_MAP.SPOTLIGHT.EXPORT_TITLE')),
      content: BodyContent(t('FARM_MAP.SPOTLIGHT.EXPORT')),
      locale: {
        last: NextButtonContent(t('common:GOT_IT')),
      },
      placement: 'top-start',
      showCloseButton: false,
      styles: {
        options: {
          width: 210,
        },
      },
      floaterProps: {
        styles: {
          floater: {
            marginRight: '12px',
          },
        },
      },
    },
  ];

  const [state, setState] = React.useState({
    bottom: false,
  });

  let [height, setHeight] = useState(0);
  let [visibility, setVisibility] = useState(false);
  const [selected, setSelected] = useState([]);

  const useStyles = makeStyles({
    list: {
      width: 250,
      height: height,
    },
    fullList: {
      width: 'auto',
    },
  });

  const classes = useStyles();

  useEffect(() => {
    setHeight(window.innerHeight / 2);
  }, []);

  const toggleDrawer = (anchor, open) => () => {
    setState({ ...state, [anchor]: open });
    if (!open) setHeight(window.innerHeight / 2);
  };

  const areaImgDict = [
    { name: 'Barn', img: Barn },
    { name: 'Ceremonial Area', img: CeremonialArea },
    { name: 'Farm Site Boundary', img: FarmSiteBoundary },
    { name: 'Field', img: Field },
    { name: 'Greenhouse', img: Greenhouse },
    { name: 'Groundwater', img: Groundwater },
    { name: 'Natural area', img: NaturalArea },
  ];

  const lineImgDict = [
    { name: 'Buffer Zone', img: BufferZone },
    { name: 'Creek', img: Creek },
    { name: 'Fence', img: Fence },
  ];

  const pointImgDict = [
    { name: 'Gate', img: Gate },
    { name: 'Water Valve', img: WaterValve },
  ];

  const selectOrDeselect = (id) => {
    setVisibility(false);
    const layers = selected.includes(id)
      ? selected.filter((layerID) => id !== layerID)
      : selected.concat(id);
    setSelected(layers);
  };

  const setAllVisibility = () => {
    setSelected([]);
    setVisibility(false);
  };

  const setAllVisibilityOff = () => {
    setVisibility(true);
    areaImgDict.map((item) => {
      selected.push(item.name);
    });
    lineImgDict.map((item) => {
      selected.push(item.name);
    });
    pointImgDict.map((item) => {
      selected.push(item.name);
    });
    selected.push('Satellite background');
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'bottom',
      })}
      role="presentation"
    >
      <div
        style={{
          elevation: 0,
          backgroundColor: 'white',
          borderRadius: '16px 16px 0px 0px',
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ marginLeft: '45.56%', marginTop: '45.83%' }}>
          <img src={GreenLine} onClick={() => setHeight(window.innerHeight - 75)} />
        </div>
        <div style={{ marginLeft: '6.67%', paddingTop: '10px' }}>
          <Semibold>Filter your map</Semibold>
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
                Show all
                <img style={{ paddingLeft: '6px', paddingRight: '6px' }} src={Line} />{' '}
              </p>
            </div>
            <div
              onClick={() => {
                setAllVisibilityOff();
                setRoadview(true);
              }}
            >
              <p>Hide all</p>
            </div>
          </div>
        </div>
        <div>
          <List>
            {['Satellite background'].map((text) => (
              <ListItem
                style={
                  selected.includes(text)
                    ? { backgroundColor: '#F3F6FB' }
                    : { backgroundColor: 'white' }
                }
                button
                key={text}
              >
                <ListItemIcon>
                  {<img src={MapBackground} style={{ paddingLeft: '20px' }} />}{' '}
                </ListItemIcon>

                <ListItemText primary={text} />
                <div style={{ paddingRight: '24px' }}>
                  {visibility || selected.includes(text) ? (
                    <MdVisibilityOff
                      size={24}
                      color={'#66738A'}
                      onClick={() => {
                        selectOrDeselect(text);
                        setRoadview(false);
                      }}
                    />
                  ) : (
                    <MdVisibility
                      size={24}
                      color={'#66738A'}
                      onClick={() => {
                        selectOrDeselect(text);
                        setRoadview(true);
                      }}
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
                Areas <img src={Rectangle} style={{ paddingLeft: '6px', marginRight: '24px' }} />{' '}
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
                {item.name === 'Farm Site Boundary' ? (
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
                Lines <img src={Rectangle} style={{ paddingLeft: '6px', marginRight: '24px' }} />{' '}
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
                Points <img src={Rectangle} style={{ paddingLeft: '6px', marginRight: '24px' }} />{' '}
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
        </div>
      </div>
      <Divider />
    </div>
  );

  const { container, button, svg, spotlighted } = styles;
  return (
    <>
      {showSpotlight && (
        <Joyride
          steps={steps}
          continuous
          callback={resetSpotlightStatus}
          floaterProps={{ disableAnimation: true }}
          styles={{
            options: {
              // modal arrow color
              arrowColor: '#fff',
              // modal background color
              backgroundColor: '#fff',
              // tooltip overlay color
              overlayColor: 'rgba(30, 30, 48, 1)',
              // next button color
              primaryColor: '#FCE38D',
              //width of modal
              width: 270,
              //zindex of modal
              zIndex: 100,
            },
            buttonClose: {
              display: 'none',
            },
            buttonBack: {
              display: 'none',
            },
            tooltip: {
              padding: '20px',
            },
            tooltipContent: {
              padding: '4px 0 0 0',
              marginBottom: '20px',
            },
          }}
        />
      )}
      <div className={clsx(container, className)} style={style}>
        {isAdmin && (
          <button
            className={clsx(button, stepSpotlighted === 0 && spotlighted)}
            id="mapFirstStep"
            onClick={onClickAdd}
          >
            <AddLogo className={svg} />
          </button>
        )}
        <button
          className={clsx(button, stepSpotlighted === 1 && spotlighted)}
          id="mapSecondStep"
          onClick={onClickFilter}
        >
          <div>
            {['bottom'].map((anchor) => (
              <React.Fragment key={anchor}>
                <FilterLogo className={svg} onClick={toggleDrawer(anchor, true)} />
                <div>
                  <SwipeableDrawer
                    anchor={anchor}
                    open={state[anchor]}
                    onClose={toggleDrawer(anchor, false)}
                    onOpen={toggleDrawer(anchor, true)}
                    PaperProps={{
                      style: { backgroundColor: 'transparent' },
                      square: false,
                    }}
                  >
                    {list(anchor)}
                  </SwipeableDrawer>
                </div>
              </React.Fragment>
            ))}
          </div>
        </button>
        <button
          className={clsx(button, (stepSpotlighted === 2 || showModal) && spotlighted)}
          id="mapThirdStep"
          onClick={onClickExport}
        >
          <ExportLogo className={svg} />
        </button>
      </div>
    </>
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
};

const TitleContent = (text) => {
  return (
    <span className={styles.spotlightTitle}>
      <p align="left" className={styles.spotlightText}>
        {text}
      </p>
    </span>
  );
};

const BodyContent = (text) => {
  const { t } = useTranslation();
  return (
    <>
      <p align="left">{t('FARM_MAP.SPOTLIGHT.HERE_YOU_CAN')}</p>
      <ul style={{ paddingInlineStart: '20px' }}>
        {text.split(',').map(function (item, key) {
          return (
            <li key={key} className={styles.spotlightText}>
              {item}
            </li>
          );
        })}
      </ul>
    </>
  );
};

const NextButtonContent = (text) => {
  return <span className={styles.spotlightButton}>{text}</span>;
};
