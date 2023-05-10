import React from 'react';
import PropTypes from 'prop-types';
import PureSensorReadingsLineChart from '../../components/SensorReadingsLineChart';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import Spinner from '../../components/Spinner';
import { Semibold } from '../../components/Typography';
import { measurementSelector } from '../../containers/userFarmSlice';
import { ambientTemperature, soilWaterPotential } from '../../util/convert-units/unit';
import { getUnitOptionMap } from '../../util/convert-units/getUnitOptionMap';
import {
  CHART_LINE_COLORS,
  CURRENT_DATE_TIME,
  SOIL_WATER_POTENTIAL,
  SOIL_WATER_CONTENT,
  TEMPERATURE,
} from '../SensorReadings/constants';
import { useTranslation } from 'react-i18next';

const SensorReadingsLineChart = ({ readingType, noDataFoundMessage, data, loading }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { sensor_reading_chart } = useSelector(showedSpotlightSelector);
  const resetSpotlight = () => {
    dispatch(setSpotlightToShown('sensor_reading_chart'));
  };
  const unitSystem = useSelector(measurementSelector);
  const title = t(`SENSOR.${readingType.toUpperCase()}_READINGS_OF_SENSOR.TITLE`);
  const readingTypeDataExists = data?.sensorReadingData?.find(
    (rd) => rd[data.selectedSensorName] && rd[data.selectedSensorName] != '(no data)',
  );
  let isActive = readingTypeDataExists ? true : false;
  let unit;
  let subTitle;
  let weatherStationName;

  // Reading type differences --
  if (readingType === TEMPERATURE) {
    const weatherStationDataExists = data?.sensorReadingData?.find(
      (rd) => rd[data.stationName] != '(no data)',
    );
    unit = getUnitOptionMap()[ambientTemperature[unitSystem].defaultUnit].label;
    isActive = weatherStationDataExists || readingTypeDataExists ? true : false;
    subTitle = t(`SENSOR.${readingType.toUpperCase()}_READINGS_OF_SENSOR.SUBTITLE`, {
      high: data.latestTemperatureReadings.tempMax,
      low: data.latestTemperatureReadings.tempMin,
      units: unit,
    });
    weatherStationName =
      t(`SENSOR.${readingType.toUpperCase()}_READINGS_OF_SENSOR.WEATHER_STATION`, {
        weatherStationLocation: data.stationName,
      }) || null;
  }
  if (readingType === SOIL_WATER_POTENTIAL)
    unit = getUnitOptionMap()[soilWaterPotential[unitSystem].defaultUnit].label;
  if (readingType === SOIL_WATER_CONTENT) unit = '%';

  return (
    <>
      {loading && (
        <div className={styles.loaderWrapper}>
          <Spinner />
        </div>
      )}
      {!isActive && (
        <>
          <div className={styles.titleWrapper}>
            <label>
              <Semibold className={styles.title}>{title}</Semibold>
            </label>
          </div>
          <div className={styles.emptyRect}>
            <label className={styles.emptyRectMessasge}>{noDataFoundMessage}</label>
          </div>
        </>
      )}
      {isActive && data && data.sensorReadingData?.length && unit && (
        <PureSensorReadingsLineChart
          showSpotLight={!sensor_reading_chart}
          resetSpotlight={resetSpotlight}
          title={title}
          subTitle={subTitle}
          weatherStationName={weatherStationName}
          yAxisLabel={t(`SENSOR.${readingType.toUpperCase()}_READINGS_OF_SENSOR.Y_AXIS_LABEL`, {
            units: unit,
          })}
          xAxisLabel={data.xAxisLabel}
          predictedXAxisLabel={data.predictedXAxisLabel}
          sensorReadings={data.sensorReadingData}
          lastUpdatedReadings={data.lastUpdatedReadingsTime}
          xAxisDataKey={CURRENT_DATE_TIME}
          yAxisDataKeys={Object.keys(data.sensorReadingData[0])
            .filter((f) => f !== CURRENT_DATE_TIME)
            .sort()} // or != xAxisDataKey
          lineColors={CHART_LINE_COLORS}
        />
      )}
    </>
  );
};

SensorReadingsLineChart.propTypes = {
  readingType: PropTypes.string.isRequired,
  noDataFoundMessage: PropTypes.string.isRequired,
};

export default SensorReadingsLineChart;
