import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';
import CompactPreview from './CompactPreview';

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
    left: -105,
    pointerEvents: 'initial',
    backgroundColor: 'white',
    boxShadow: '2px 6px 12px rgba(102, 115, 138, 0.2)',
    padding: 0,
    borderRadius: '4px',
    maxWidth: '264px',
    userSelect: 'none',
    color: colors.grey900,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: 'Open Sans, SansSerif, serif',
  },
  body: {
    position: 'relative',
    padding: 5,
  },
}));

export default function PurePreviewPopup({ location, history, sensorReadings, styleOverride }) {
  const classes = useStyles();

  const loadEditView = (location) => {
    history.push(`/${location.type}/${location.id}/details`);
  };
  if (sensorReadings.length) {
    return (
      <div onClick={() => loadEditView(location)} className={classes.container}>
        <div className={classes.tooltip} style={styleOverride}>
          <div className={classes.arrow} />
          <div className={classes.body}>
            {sensorReadings.map((sensorReading, idx) => (
              <CompactPreview key={idx} sensorReading={sensorReading} history={history} />
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}

PurePreviewPopup.prototype = {
  location: PropTypes.object,
  history: PropTypes.func,
};
