import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { areaImgDict, lineImgDict, pointImgDict } from '../LocationMapping';
import { containsCrops, longPress } from '../../../containers/Map/constants';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';
import PurePreviewPopup from '../PreviewPopup';
import { SENSOR } from '../../../containers/SensorReadings/constants';
import { isTouchDevice } from '../../../util/device';

const useStyles = makeStyles((theme) => ({
  container: {
    left: 100,
    '&:hover': {
      backgroundColor: colors.green100,
    },
    backgroundColor: 'white',
    marginBottom: '5px',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 160,
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

  const [isSensor, setIsSensor] = useState(false);
  const [sensorIdx, setSensorIdx] = useState(null);
  const longPressed = useRef(false);

  const handleMouseDown = (location, idx) => {
    longPressed.current = false;
    setTimeout(function () {
      longPressed.current = true;
      if (location.type === SENSOR && longPressed.current) {
        setIsSensor(true);
        setSensorIdx(idx);
      }
    }, longPress);
  };

  const handleMouseUp = (location) => {
    if (!longPressed.current) {
      loadEditView(location);
    }
  };

  const loadEditView = (location) => {
    containsCrops(location.type)
      ? history.push(`/${location.type}/${location.id}/crops`)
      : history.push(`/${location.type}/${location.id}/details`);
  };

  const removeSelect = isTouchDevice()
    ? {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        MozUserSelect: 'none',
      }
    : {};

  return locations.map((location, idx) => {
    const { type, asset, name } = { ...location };
    let icon = imgMapping(asset, type);

    return (
      <div
        key={idx}
        {...(isTouchDevice()
          ? {
              onTouchStart: (e) => {
                e.stopPropagation();
                handleMouseDown(location, idx);
              },
              onTouchEnd: () => handleMouseUp(location),
            }
          : {
              onMouseDown: (e) => {
                e.stopPropagation();
                handleMouseDown(location, idx);
              },
              onMouseUp: () => handleMouseUp(location),
            })}
      >
        <div className={classes.container}>
          <div style={{ float: 'left', paddingTop: '8px', paddingLeft: '20px', ...removeSelect }}>
            {' '}
            {icon}{' '}
          </div>
          <div style={{ padding: '12px 20px 10px 55px', lineBreak: 'auto', ...removeSelect }}>
            {name}
          </div>
        </div>
        {isSensor && sensorIdx === idx && (
          <PurePreviewPopup
            location={location}
            history={history}
            sensorReadings={sensorReadings}
            styleOverride={{ marginTop: 12, marginBottom: 10, position: 'relative', left: 0 }}
          />
        )}
      </div>
    );
  });
}

PureSelectionHandler.prototype = {
  locations: PropTypes.array,
  history: PropTypes.func,
};
