import { React } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { getUnitOptionMap } from '../../util/convert-units/getUnitOptionMap';
import { ReactComponent as Themometer } from '../../assets/images/map/themometer.svg';

const ForecastInfo = ({ data }) => {
  const { latestTemperatureReadings, stationName, unit } = data;
  const { t } = useTranslation();

  return (
    <div className={styles.forecastInfo}>
      <div className={styles.forecastInfoTitle}>
        <Themometer className={styles.themometerIcon} />
        {t('SENSOR.SENSOR_FORECAST.TITLE')}
      </div>
      <div>
        {t('SENSOR.SENSOR_FORECAST.HIGH_AND_LOW_TEMPERATURE', {
          high: latestTemperatureReadings.tempMax,
          low: latestTemperatureReadings.tempMin,
          unit: getUnitOptionMap()[unit]?.label,
        })}
      </div>
      <div>
        {t('SENSOR.SENSOR_FORECAST.WEATHER_STATION', {
          weatherStationLocation: stationName,
          interpolation: { escapeValue: false },
        })}
      </div>
    </div>
  );
};

export default ForecastInfo;
