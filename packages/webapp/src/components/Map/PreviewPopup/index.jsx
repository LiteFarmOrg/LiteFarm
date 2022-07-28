import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';
import CompactPreview from './CompactPreview';
import { TEMPERATURE } from '../../../containers/SensorReadings/constants';

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
    marginTop: 5,
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
  const { t } = useTranslation();

  const loadEditView = (location) => {
    history.push(`/${location.type}/${location.id}/details`);
  };

  let temperatureData = [];
  let sixHoursBefore = new Date();
  sixHoursBefore.setHours(sixHoursBefore.getHours() - 6);

  if (sensorReadings.length) {
    temperatureData = sensorReadings.filter(
      (sensorReading) =>
        sensorReading.reading_type === TEMPERATURE &&
        new Date(sensorReading.read_time) > sixHoursBefore,
    );
  }

  return (
    <div onClick={() => loadEditView(location)} className={classes.container}>
      <div className={classes.tooltip} style={styleOverride}>
        <div className={classes.arrow} />
        <div className={classes.body}>
          <CompactPreview
            title={t('SENSOR.READING.TEMPERATURE')}
            value={temperatureData.length ? temperatureData[0].value : null}
            unit={temperatureData.length ? temperatureData[0].unit : null}
          />
          {/*other compact views*/}
        </div>
      </div>
    </div>
  );
}

PurePreviewPopup.prototype = {
  location: PropTypes.object,
  history: PropTypes.func,
};
