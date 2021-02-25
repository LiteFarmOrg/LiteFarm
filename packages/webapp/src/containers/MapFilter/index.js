import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Semibold } from '../../components/Typography';
import GreenLine from '../../assets/images/farmMapFilter/Green_Drawer_Line.svg';
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
import styles from './styles.scss';
import { Box } from '@material-ui/core';

export default function SwipeableTemporaryDrawer() {
  let [height, setHeight] = useState(0);
  let [visibility, setVisibility] = useState(false);
  const [selected, setSelected] = useState([]);

  const useStyles = makeStyles({
    list: {
      width: 250,
      // height: height,
    },
    fullList: {
      width: 'auto',
    },
  });

  const classes = useStyles();
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const parentRef = useRef(null);

  useEffect(() => {
    if (parentRef.current) {
      let parentHeight = parentRef.current.offsetHeight;
      setHeight(parentHeight);
    }
  }, []);

  const toggleDrawer = (anchor, open) => (event) => {
    // if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
    //   return;
    // }

    setState({ ...state, [anchor]: open });
  };

  const areaImgDict = [
    { name: 'Barn', img: Barn },
    { name: 'Ceremonial Area', img: CeremonialArea },
    { name: 'Farm Site Boundary', img: FarmSiteBoundary },
    { name: 'Field', img: Field },
    { name: 'Greenhouse', img: Greenhouse },
    { name: 'Groundwater', img: Groundwater },
    { name: 'NaturalArea', img: NaturalArea },
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

  const changeBackground = () => {
    console.log('change bg');
  };

  const selectOrDeselect = (id) => {
    console.log('change bg');
    const layers = selected.includes(id)
      ? selected.filter((layerID) => id !== layerID)
      : selected.concat(id);
    setSelected(layers);
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      //   onClick={toggleDrawer(anchor, false)}
      // onClick={setMaskVisibility}
      //   onKeyDown={toggleDrawer(anchor, false)}
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
          <img src={GreenLine} />
        </div>
        <div style={{ marginLeft: '6.67%', paddingTop: '10px' }}>
          <Semibold>Filter your map</Semibold>
          <div
            onClick={() => console.log('hello world')}
            style={{
              textDecoration: 'underline',
              color: '#AA5F04',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <p>
              Show all <img style={{ paddingLeft: '10px' }} src={Line} />{' '}
            </p>
            <p>Hide all</p>
          </div>

          {/* <div
            style={{
              textDecoration: 'underline',
              display: 'flex',
              flexDirection: 'row',
              paddingLeft: '10px',
              color: '#AA5F04',
              fontSize: '14px',
            }}
          >
            <p>Hide all</p>
          </div> */}
        </div>
        <div>
          <List>
            {['Map background'].map((text) => (
              <ListItem
                style={
                  selected.includes(text)
                    ? { backgroundColor: '#F3F6FB' }
                    : { backgroundColor: 'white' }
                }
                button
                key={text}
              >
                <ListItemIcon>{<img src={MapBackground} />} </ListItemIcon>

                <ListItemText primary={text} />
                {!selected.includes(text) ? (
                  <MdVisibility
                    size={24}
                    color={'#66738A'}
                    className={styles.visibilityIcon}
                    onClick={() => selectOrDeselect(text)}
                  />
                ) : (
                  <MdVisibilityOff
                    size={24}
                    color={'#66738A'}
                    className={styles.visibilityIcon}
                    onClick={() => selectOrDeselect(text)}
                  />
                )}
              </ListItem>
            ))}
            <div
              style={{
                marginLeft: '6.67%',
                color: '#66738A',
                fontSize: '14px',
                fontWeight: '600',
                paddingTop: '10px',
              }}
            >
              <p>
                Areas <img src={Rectangle} style={{ paddingLeft: '6px' }} />{' '}
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
                <ListItemIcon>{<img src={item.img} />}</ListItemIcon>
                <Box style={{ paddingRight: '5px' }}>{item.name}</Box>
                {item.name === 'Farm Site Boundary' ? (
                  <ListItemText
                    secondaryTypographyProps={{ align: 'left' }}
                    secondary={<img src={Leaf} />}
                  />
                ) : (
                  <ListItemText />
                )}

                {!selected.includes(item.name) ? (
                  <MdVisibility
                    size={24}
                    color={'#66738A'}
                    className={styles.visibilityIcon}
                    onClick={() => selectOrDeselect(item.name)}
                  />
                ) : (
                  <MdVisibilityOff
                    size={24}
                    color={'#66738A'}
                    className={styles.visibilityIcon}
                    onClick={() => selectOrDeselect(item.name)}
                  />
                )}
              </ListItem>
            ))}
            <div
              style={{
                marginLeft: '6.67%',
                color: '#66738A',
                fontSize: '14px',
                fontWeight: '600',
                paddingTop: '10px',
              }}
            >
              <p>
                Lines <img src={Rectangle} style={{ paddingLeft: '6px' }} />{' '}
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
                <ListItemIcon>{<img src={item.img} />}</ListItemIcon>
                <ListItemText primary={item.name} />
                {!selected.includes(item.name) ? (
                  <MdVisibility
                    size={24}
                    color={'#66738A'}
                    className={styles.visibilityIcon}
                    onClick={() => selectOrDeselect(item.name)}
                  />
                ) : (
                  <MdVisibilityOff
                    size={24}
                    color={'#66738A'}
                    className={styles.visibilityIcon}
                    onClick={() => selectOrDeselect(item.name)}
                  />
                )}
              </ListItem>
            ))}
            <div
              style={{
                marginLeft: '6.67%',
                color: '#66738A',
                fontSize: '14px',
                fontWeight: '600',
                paddingTop: '10px',
              }}
            >
              <p>
                Points <img src={Rectangle} style={{ paddingLeft: '6px' }} />{' '}
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
                <ListItemIcon>{<img src={item.img} />}</ListItemIcon>
                <ListItemText primary={item.name} />
                {!selected.includes(item.name) ? (
                  <MdVisibility
                    size={24}
                    color={'#66738A'}
                    className={styles.visibilityIcon}
                    onClick={() => selectOrDeselect(item.name)}
                  />
                ) : (
                  <MdVisibilityOff
                    size={24}
                    color={'#66738A'}
                    className={styles.visibilityIcon}
                    onClick={() => selectOrDeselect(item.name)}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </div>
      </div>
      <Divider />
    </div>
  );

  return (
    <div ref={parentRef}>
      {['left', 'right', 'top', 'bottom'].map((anchor) => (
        <React.Fragment key={anchor}>
          <Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button>
          <div>
            <SwipeableDrawer
              anchor={anchor}
              open={state[anchor]}
              onClose={toggleDrawer(anchor, false)}
              onOpen={toggleDrawer(anchor, true)}
              PaperProps={{
                elevation: 0,
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
  );
}
