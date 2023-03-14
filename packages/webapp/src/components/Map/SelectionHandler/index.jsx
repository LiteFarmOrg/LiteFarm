import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { areaImgDict, lineImgDict, pointImgDict } from '../LocationMapping';
import { ReactComponent as ShowMore } from '../../../assets/images/map/arrowDown.svg';
import { containsCrops } from '../../../containers/Map/constants';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';
import CompactPreview from '../PreviewPopup/CompactPreview';
import { SENSOR } from '../../../containers/SensorReadings/constants';
import { isTouchDevice } from '../../../util/device';
import { useSelector } from 'react-redux';
import { sensorReadingTypesByMultipleLocations } from '../../../containers/sensorReadingTypesSlice';
import { TEMPERATURE, SOIL_WATER_POTENTIAL } from '../../../containers/SensorReadings/constants';

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
    marginTop: -20,
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
  tooltipWithSoilWaterPotential: {
    width: '290px',
    left: -140,
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
  itemName: {
    flexGrow: 1,
    padding: '0 8px',
    lineBreak: 'auto',
  },
  sensorBody: {
    height: 'auto',
    transition: 'all 1s',
    overflow: 'hidden',
  },
  bodyClosed: {
    maxHeight: 0,
  },
  bodyOpen: {
    maxHeight: '65px',
    paddingBottom: '8px',
  },
  sensorArrow: {
    display: 'flex',
    flexDirection: 'row',
    alginSelf: 'center',
    transition: 'transform 1s',
  },
  sensorArrowUp: {
    transform: 'rotate(-180deg)',
  },
}));

export default function PureSelectionHandler({ locations, history, sensorReadings }) {
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

  const [sensorIdx, setSensorIdx] = useState(null);
  const locationSensors = locations.filter((location) => location.type === SENSOR);

  const readingTypes = useSelector(sensorReadingTypesByMultipleLocations(locationSensors));

  const showDetails = (id) => {
    let sensor = readingTypes.find((sensor) => sensor.location_id === id);
    return (
      sensor?.reading_types.includes(TEMPERATURE) ||
      sensor?.reading_types.includes(SOIL_WATER_POTENTIAL)
    );
  };

  const handleMouseUp = (location, idx) => {
    if (sensorIdx === idx) {
      setSensorIdx(null);
      return;
    }
    if (location.type === SENSOR) {
      setSensorIdx(idx);
    } else {
      setSensorIdx(null);
      loadEditView(location);
    }
  };

  const loadEditView = (location) => {
    if (containsCrops(location.type)) {
      history.push(`/${location.type}/${location.id}/crops`);
    } else {
      history.push(`/${location.type}/${location.id}/details`);
    }
  };

  const removeSelect = isTouchDevice()
    ? {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        MozUserSelect: 'none',
      }
    : {};

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
                    onTouchEnd: () => handleMouseUp(location, idx),
                  }
                : {
                    onMouseDown: (e) => {
                      e.stopPropagation();
                    },
                    onMouseUp: () => handleMouseUp(location, idx),
                  })}
            >
              <div className={classes.title}>
                <div
                  className={clsx(classes.itemIcon, showDetails(location.id) && classes.sensorIcon)}
                >
                  {' '}
                  {icon}{' '}
                </div>
                <div className={classes.itemName}>{name}</div>
                {showDetails(location.id) && (
                  <div>
                    {' '}
                    {
                      <ShowMore
                        className={clsx(
                          classes.sensorArrow,
                          sensorIdx === idx && classes.sensorArrowUp,
                        )}
                      />
                    }{' '}
                  </div>
                )}
              </div>
              {readingTypes
                .find((sensor) => sensor.location_id === location.id)
                ?.reading_types.map((type, rid) => {
                  if ([TEMPERATURE, SOIL_WATER_POTENTIAL].includes(type)) {
                    return (
                      <div
                        key={rid}
                        className={clsx(
                          classes.sensorBody,
                          sensorIdx === idx && classes.bodyOpen,
                          sensorIdx !== idx && classes.bodyClosed,
                        )}
                      >
                        <CompactPreview
                          location={location}
                          readings={sensorReadings}
                          readingType={type}
                          history={history}
                        />
                      </div>
                    );
                  }
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

PureSelectionHandler.prototype = {
  locations: PropTypes.array,
  history: PropTypes.func,
};
