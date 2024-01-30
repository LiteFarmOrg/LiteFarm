/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import { React } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { getUnitOptionMap } from '../../util/convert-units/getUnitOptionMap';
import Themometer from '../../assets/images/map/themometer.svg';

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
