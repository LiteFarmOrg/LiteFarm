import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { pointImgDict } from '../LocationMapping';
import { lineImgDict } from '../LocationMapping';
import { areaImgDict } from '../LocationMapping';

export default function PureSelectionHandler({ locations }) {
  const [icon, setIcon] = useState(null);
  const [locationName, setLocationName] = useState(null);

  const imgMapping = (assetType, locationtype, name) => {
    assetType === 'point'
      ? Object.keys(pointImgDict).map((item) => {
          if (pointImgDict[item].key === locationtype) {
            setIcon(pointImgDict[item].icon);
            setLocationName(name);
          }
        })
      : assetType === 'line'
      ? Object.keys(lineImgDict).map((item) => {
          if (lineImgDict[item].key === locationtype) {
            setIcon(lineImgDict[item].icon);
            setLocationName(name);
          }
        })
      : Object.keys(areaImgDict).map((item) => {
          if (areaImgDict[item].key === locationtype) {
            setIcon(areaImgDict[item].icon);
            setLocationName(name);
          }
        });
  };

  useEffect(() => {
    locations.forEach((location) => {
      console.log(location);
      imgMapping(location.asset, location.type, location.name);
    });
  }, []);

  return (
    <div style={{ backgroundColor: 'white' }}>
      <div style={{ float: 'left', paddingTop: '10px', paddingLeft: '10px' }}> {icon} </div>
      <div style={{ padding: '5px 50px 25px' }}>{locationName}</div>
    </div>
  );
}

// padding: '5px 30px 7px'

PureSelectionHandler.prototype = {
  assetType: PropTypes.string,
  locationtype: PropTypes.string,
  locationName: PropTypes.string,
  //   closeSuccessHeader: PropTypes.func,
};
