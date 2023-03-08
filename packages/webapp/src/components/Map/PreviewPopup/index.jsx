import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';
import CompactPreview from './CompactPreview';
import { TEMPERATURE, SOIL_WATER_POTENTIAL } from '../../../containers/SensorReadings/constants';
import { useSelector } from 'react-redux';
import { sensorReadingTypesByLocationSelector } from '../../../containers/sensorReadingTypesSlice';
import clsx from 'clsx';

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
    left: -104,
    top: 30,
    pointerEvents: 'initial',
    backgroundColor: 'white',
    boxShadow: '2px 6px 12px rgba(102, 115, 138, 0.2)',
    padding: 0,
    borderRadius: '4px',
    width: '210px',
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
  header: {
    padding: '8px 8px 0 8px',
  },
  title: {
    paddingBottom: '8px',
    fontWeight: 'bold',
    borderBottom: '1px solid',
    borderBottomColor: 'var(--grey400)',
  },
  body: {
    position: 'relative',
    paddingBottom: 8,
  },
}));

export default function PurePreviewPopup({ location, history, sensorReadings, styleOverride }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { reading_types = [] } = useSelector(sensorReadingTypesByLocationSelector(location.id));

  const displayPopup =
    reading_types?.includes(TEMPERATURE) || reading_types?.includes(SOIL_WATER_POTENTIAL);

  if (displayPopup) {
    return (
      <div className={classes.container}>
        <div
          className={clsx({
            [classes.tooltip]: true,
            [classes.tooltipWithSoilWaterPotential]: reading_types?.includes(SOIL_WATER_POTENTIAL),
          })}
          style={styleOverride}
        >
          <div className={classes.arrow} />
          <div className={classes.header}>
            <div className={classes.title}>{location.name}</div>
          </div>
          <div className={classes.body}>
            {reading_types.map((reading_type, idx) => {
              /**
               * Add other reading types in the if below when other compact components are added to CompactPreview
               */
              if (reading_type === TEMPERATURE || reading_type === SOIL_WATER_POTENTIAL) {
                return (
                  <CompactPreview
                    key={idx}
                    location={location}
                    readings={sensorReadings}
                    readingType={reading_type}
                  />
                );
              }
            })}
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
