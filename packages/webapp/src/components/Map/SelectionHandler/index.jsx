import React from 'react';
import PropTypes from 'prop-types';
import { areaImgDict, lineImgDict, pointImgDict } from '../LocationMapping';
import { containsCrops } from '../../../containers/Map/constants';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';

const useStyles = makeStyles((theme) => ({
  container: {
    '&:hover': {
      backgroundColor: colors.green100,
    },
    backgroundColor: 'white',
    marginBottom: '5px',
  },
}));

export default function PureSelectionHandler({ locations, history }) {
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

  const loadEditView = (location) => {
    containsCrops(location.type)
      ? history.push(`/${location.type}/${location.id}/crops`)
      : history.push(`/${location.type}/${location.id}/details`);
  };

  return locations.map((location, idx) => {
    const { type, asset, name } = { ...location };
    let icon = imgMapping(asset, type);

    return (
      <div key={idx} onClick={() => loadEditView(location)} className={classes.container}>
        <div style={{ float: 'left', paddingTop: '8px', paddingLeft: '20px' }}> {icon} </div>
        <div style={{ padding: '12px 20px 10px 55px' }}>{name}</div>
      </div>
    );
  });
}

PureSelectionHandler.prototype = {
  locations: PropTypes.array,
  history: PropTypes.func,
};
