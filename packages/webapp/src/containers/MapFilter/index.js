import React from 'react';
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
import { MdVisibility, MdVisibilityOff } from 'react-icons/all';
import styles from './styles.scss';

const useStyles = makeStyles({
  list: {
    width: 250,
    height: window.innerHeight / 2,
  },
  fullList: {
    width: 'auto',
  },
});

export default function SwipeableTemporaryDrawer() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const areaImgDict = [
    { name: 'Barn', img: Barn },
    { name: 'CeremonialArea', img: CeremonialArea },
    { name: 'FarmSiteBoundary', img: FarmSiteBoundary },
    { name: 'Field', img: Field },
    { name: 'Greenhouse', img: Greenhouse },
    { name: 'Groundwater', img: Groundwater },
    { name: 'NaturalArea', img: NaturalArea },
  ];

  const lineImgDict = [
    { name: 'BufferZone', img: BufferZone },
    { name: 'Creek', img: Creek },
    { name: 'Fence', img: Fence },
  ];

  const pointImgDict = [
    { name: 'Gate', img: Gate },
    { name: 'WaterValve', img: WaterValve },
  ];

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <div
        style={{
          elevation: 0,
          backgroundColor: 'white',
          borderRadius: '16px 16px 0px 0px',
          boxSAhadow: '0px 0px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ marginLeft: '45.56%', marginTop: '45.83%' }}>
          <img src={GreenLine} />
        </div>
        <div style={{ marginLeft: '6.67%', paddingTop: '10px' }}>
          <Semibold>Filter your map</Semibold>
          <div style={{ margin: 'auto' }}>
            <div
              style={{
                textDecoration: 'underline',
                float: 'left',
                color: '#AA5F04',
                fontSize: '14px',
              }}
            >
              <p>Show all</p>
            </div>
            <div
              style={{
                textDecoration: 'underline',
                float: 'left',
                paddingLeft: '10px',
                color: '#AA5F04',
                fontSize: '14px',
              }}
            >
              <p>Hide all</p>
            </div>
          </div>
        </div>
        <List>
          {['Map background'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index === 0 && <img src={MapBackground} />} </ListItemIcon>
              <ListItemText primary={text} />
              <MdVisibility className={styles.visibilityIcon} />
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
            <p>Areas</p>
          </div>
          {areaImgDict.map((item) => (
            <ListItem button key={item.name}>
              <ListItemIcon>{<img src={item.img} />}</ListItemIcon>
              <ListItemText primary={item.name} />
              <MdVisibility className={styles.visibilityIcon} />
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
            <p>Lines</p>
          </div>
          {lineImgDict.map((item) => (
            <ListItem button key={item.name}>
              <ListItemIcon>{<img src={item.img} />}</ListItemIcon>
              <ListItemText primary={item.name} />
              <MdVisibility className={styles.visibilityIcon} />
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
            <p>Points</p>
          </div>
          {pointImgDict.map((item) => (
            <ListItem button key={item.name}>
              <ListItemIcon>{<img src={item.img} />}</ListItemIcon>
              <ListItemText primary={item.name} />
              <MdVisibility className={styles.visibilityIcon} />
            </ListItem>
          ))}
        </List>
        ,
      </div>
      <Divider />
    </div>
  );

  return (
    <div>
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
