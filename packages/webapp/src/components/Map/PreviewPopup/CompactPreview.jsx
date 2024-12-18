import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@mui/styles';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import { useSelector } from 'react-redux';
import { TEMPERATURE, SOIL_WATER_POTENTIAL } from '../../../containers/SensorReadings/constants';
import {
  getSoilWaterPotentialUnit,
  getSoilWaterPotentialValue,
  getTemperatureUnit,
  getTemperatureValue,
} from './utils';
import { isTouchDevice } from '../../../util/device';
import { useNavigate } from 'react-router';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 200,
    padding: '8px 8px 2px 8px',
  },
  highlight: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 200,
    padding: 5,
    backgroundColor: 'rgb(243, 246, 251)',
  },
  title: {},
  value: {
    fontWeight: 'bold',
  },
  error: {
    color: 'var(--red700)',
  },
}));

export default function CompactPreview({ location, readings, readingType }) {
  let navigate = useNavigate();
  const classes = useStyles();
  const { t } = useTranslation();
  const { units } = useSelector(userFarmSelector);

  let title = '';
  if (readingType === TEMPERATURE) {
    title = t('SENSOR.READINGS_PREVIEW.TEMPERATURE');
  } else if (readingType === SOIL_WATER_POTENTIAL) {
    title = t('SENSOR.READINGS_PREVIEW.SOIL_WATER_POTENTIAL');
  }

  const loadReadingView = () => {
    navigate(`/${location.type}/${location.id}/readings`);
  };

  let sensorData = [];
  let sixHoursBefore = new Date();
  sixHoursBefore.setHours(sixHoursBefore.getHours() - 6);

  if (readings.length) {
    sensorData = readings.filter(
      (sensorReading) =>
        sensorReading.reading_type === readingType &&
        sensorReading.location_id === location.id &&
        new Date(sensorReading.read_time) > sixHoursBefore,
    );
  }

  const latestSensorData = sensorData[0];

  let unit = null;
  let value = null;
  if (readingType === TEMPERATURE) {
    unit = sensorData?.length ? getTemperatureUnit(units?.measurement) : null;
    value = getTemperatureValue(latestSensorData?.value, units?.measurement);
  } else {
    unit = sensorData?.length ? getSoilWaterPotentialUnit(units?.measurement) : null;
    value = getSoilWaterPotentialValue(latestSensorData?.value, units?.measurement);
  }

  const [isClicked, setIsClicked] = useState(false);

  const onMouseDown = (e) => {
    e.stopPropagation();
    setIsClicked(true);
  };

  const onMouseUp = () => {
    if (isClicked) loadReadingView();
  };

  return (
    <div
      className={isClicked ? classes.highlight : classes.container}
      {...(isTouchDevice()
        ? {
            onTouchStart: onMouseDown,
            onTouchEnd: onMouseUp,
          }
        : {
            onMouseDown: onMouseDown,
            onMouseUp: onMouseUp,
          })}
    >
      <div className={classes.title}>{title}:</div>
      <div className={value ? classes.value : classes.error}>
        {value ? value : t('SENSOR.READING.UNKNOWN')}
        {unit}
      </div>
    </div>
  );
}
