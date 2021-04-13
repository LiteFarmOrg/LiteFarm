import React from 'react';
import PropTypes from 'prop-types';
import { pointImgDict } from '../LocationMapping';
import { lineImgDict } from '../LocationMapping';
import { areaImgDict } from '../LocationMapping';

export default function PureSelectionHandler({ locations, history }) {
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

  const loadEditView = (location) => {
    history.push(`/${location.type}/${location.id}/edit`);
  };

  return locations.map((location, idx) => {
    const { type, asset, name } = { ...location };
    let icon = imgMapping(asset, type);

    return (
      <div
        key={idx}
        style={{ backgroundColor: 'white', marginBottom: '5px' }}
        onClick={() => loadEditView(location)}
      >
        <div style={{ float: 'left', paddingTop: '10px', paddingLeft: '20px' }}> {icon} </div>
        <div style={{ padding: '15px 20px 10px 70px' }}>{name}</div>
      </div>
    );
  });
}

PureSelectionHandler.prototype = {
  locations: PropTypes.array,
  history: PropTypes.func,
};
