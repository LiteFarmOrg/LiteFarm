import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { areaImgDict, lineImgDict, pointImgDict } from '../LocationMapping';
import { makeStyles } from '@mui/styles';
import { colors } from '../../../assets/theme';
import { isTouchDevice } from '../../../util/device';
import { SensorType } from '../../../containers/SensorList/useGroupedSensors';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
  },
  arrow: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderColor: 'transparent',
    borderRightColor: 'transparent',
    borderStyle: 'solid',
    left: '45%',
    marginTop: -19,
    borderWidth: '10px 10px 10px 10px',
    borderBottomColor: 'white',
  },
  tooltip: {
    position: 'absolute',
    left: -140,
    top: 30,
    pointerEvents: 'initial',
    backgroundColor: 'white',
    boxShadow: '2px 6px 12px rgba(102, 115, 138, 0.2)',
    padding: 0,
    borderRadius: '4px',
    width: '290px',
    marginTop: 5,
    userSelect: 'none',
    color: colors.grey900,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: 'Open Sans, SansSerif, serif',
  },
  itemHeader: {
    padding: '0 8px 0 8px',
  },
  title: {
    padding: '8px 0 0 0',
    fontWeight: 'bold',
    borderBottom: '1px solid',
    borderBottomColor: 'var(--grey400)',
    display: 'flex',
    justifyContent: 'space-between',
  },
  itemIcon: {
    padding: '0 8px',
    height: 24,
  },
  sensorIcon: {
    '& svg': {
      width: 24,
      height: 24,
      transform: 'scale(1.25)',
    },
  },
  sensorArrayIcon: {
    '& svg': {
      width: 24,
    },
  },
  areaIcon: {
    '& svg': {
      width: 24,
      height: 24,
      transform: 'scale(0.75)',
    },
  },
  itemName: {
    flexGrow: 1,
    padding: '0 8px',
    lineBreak: 'auto',
  },
}));

export default function PureSelectionHandler({ locations }) {
  const navigate = useNavigate();
  const classes = useStyles();
  const imgMapping = (assetType, locationType) => {
    let icon = null;
    if (assetType === 'area') {
      Object.keys(areaImgDict).map((item) => {
        if (areaImgDict[item].key === locationType) {
          icon = areaImgDict[item].icon;
        }
      });
    } else if (assetType === 'line') {
      Object.keys(lineImgDict).map((item) => {
        if (lineImgDict[item].key === locationType) {
          icon = lineImgDict[item].icon;
        }
      });
    } else {
      Object.keys(pointImgDict).map((item) => {
        if (pointImgDict[item].key === locationType) {
          icon = pointImgDict[item].icon;
        }
      });
    }
    return icon;
  };

  const locationSensors = locations.filter((location) => location.type === SensorType.SENSOR);
  const locationSensorArrays = locations.filter(
    (location) => location.type === SensorType.SENSOR_ARRAY,
  );

  const isSensor = (id) => {
    return locationSensors.some((sensor) => sensor?.id === id);
  };

  const isSensorArray = (id) => {
    return locationSensorArrays.some((sa) => sa?.id === id);
  };

  const handleMouseUp = (location) => {
    if ([SensorType.SENSOR_ARRAY, SensorType.SENSOR].includes(location.type)) {
      navigate(`/${location.type}/${location.id}`);
    } else {
      navigate(`/${location.type}/${location.id}/details`);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.tooltip}>
        <div className={classes.arrow} />
        {locations.map((location, idx) => {
          const { type, asset, name } = { ...location };
          let icon = imgMapping(asset, type);
          return (
            <div
              className={classes.itemHeader}
              key={idx}
              {...(isTouchDevice()
                ? {
                    onTouchStart: (e) => {
                      e.stopPropagation();
                    },
                    onTouchEnd: () => handleMouseUp(location),
                  }
                : {
                    onMouseDown: (e) => {
                      e.stopPropagation();
                    },
                    onMouseUp: () => handleMouseUp(location),
                  })}
            >
              <div className={classes.title}>
                <div
                  className={clsx(
                    classes.itemIcon,
                    isSensor(location.id) && classes.sensorIcon,
                    isSensorArray(location.id) && classes.sensorArrayIcon,
                    location.asset === 'area' && classes.areaIcon,
                  )}
                >
                  {icon}
                </div>
                <div className={classes.itemName}>{name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

PureSelectionHandler.prototype = {
  locations: PropTypes.array,
};
