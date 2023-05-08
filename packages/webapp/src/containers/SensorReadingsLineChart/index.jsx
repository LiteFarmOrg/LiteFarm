import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSensorReadingsLineChart } from './useSensorReadingsLineChart';
import PureSensorReadingsLineChart from '../../components/SensorReadingsLineChart';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import Spinner from '../../components/Spinner';
import { Semibold } from '../../components/Typography';
import { ambientTemperature, soilWaterPotential } from '../../util/convert-units/unit';
import { getUnitOptionMap } from '../../util/convert-units/getUnitOptionMap';
import { measurementSelector } from '../../containers/userFarmSlice';
import {
  CURRENT_DATE_TIME,
  SOIL_WATER_POTENTIAL,
  SOIL_WATER_CONTENT,
  TEMPERATURE,
} from '../SensorReadings/constants';
import { useTranslation } from 'react-i18next';

const SensorReadingsLineChart = ({
  locationIds = [],
  readingType = '',
  noDataText = '',
  activeReadingTypes = [],
  noDataFoundMessage = '',
  derivedSensorInfo,
}) => {
  const { t } = useTranslation();
  const {
    latestMinTemperature = '',
    latestMaxTemperature = '',
    nearestStationName = '',
    lastUpdatedReadingsTime = '',
    predictedXAxisLabel = '',
    xAxisLabel = {},
  } = derivedSensorInfo;
  const lastUpdatedReadings =
    lastUpdatedReadingsTime[readingType] !== ''
      ? t('SENSOR.LAST_UPDATED', {
          latestReadingUpdate: lastUpdatedReadingsTime[readingType] ?? '',
        })
      : '';
  const unitSystem = useSelector(measurementSelector);
  const sensorVisualizationPropList = {
    [TEMPERATURE]: {
      title: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.TITLE'),
      subTitle: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.SUBTITLE', {
        high: latestMaxTemperature,
        low: latestMinTemperature,
        units: getUnitOptionMap()[ambientTemperature[unitSystem].defaultUnit].label,
      }),
      weatherStationName: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.WEATHER_STATION', {
        weatherStationLocation: nearestStationName,
      }),
      yAxisLabel: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
        units: getUnitOptionMap()[ambientTemperature[unitSystem].defaultUnit].label,
      }),
      ambientTempFor: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.AMBIENT_TEMPERATURE_FOR'),
    },
    [SOIL_WATER_POTENTIAL]: {
      title: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.TITLE'),
      yAxisLabel: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
        units: getUnitOptionMap()[soilWaterPotential[unitSystem].defaultUnit].label,
      }),
    },
    [SOIL_WATER_CONTENT]: {
      title: t('SENSOR.SOIL_WATER_CONTENT_READINGS_OF_SENSOR.TITLE'),
      yAxisLabel: t('SENSOR.SOIL_WATER_CONTENT_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
        units: '%',
      }),
    },
  };
  const xAxisDataKey = CURRENT_DATE_TIME;
  const { title, subTitle, weatherStationName, yAxisLabel, ambientTempFor } =
    sensorVisualizationPropList[readingType];
  const dispatch = useDispatch();
  const { sensor_reading_chart } = useSelector(showedSpotlightSelector);

  const resetSpotlight = () => {
    dispatch(setSpotlightToShown('sensor_reading_chart'));
  };
  const {
    sensorsReadings = [],
    yAxisDataKeys = [],
    lineColors = [],
    loading = true,
  } = useSensorReadingsLineChart(
    locationIds,
    readingType,
    noDataText,
    ambientTempFor,
    activeReadingTypes,
  );
  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <Spinner />
      </div>
    );
  } else if (!sensorsReadings.length) {
    return (
      <div>
        <div className={styles.titleWrapper}>
          <label>
            <Semibold className={styles.title}>{title}</Semibold>
          </label>
        </div>
        <div className={styles.emptyRect}>
          <label className={styles.emptyRectMessasge}>{noDataFoundMessage}</label>
        </div>
      </div>
    );
  } else {
    return (
      <PureSensorReadingsLineChart
        showSpotLight={!sensor_reading_chart}
        resetSpotlight={resetSpotlight}
        isReadingTypeActive={activeReadingTypes.includes(readingType)}
        title={title}
        subTitle={subTitle}
        xAxisDataKey={xAxisDataKey}
        yAxisDataKeys={yAxisDataKeys}
        lineColors={lineColors}
        xAxisLabel={xAxisLabel[readingType]}
        yAxisLabel={yAxisLabel}
        chartData={sensorsReadings}
        weatherStationName={weatherStationName}
        lastUpdatedReadings={lastUpdatedReadings}
        predictedXAxisLabel={predictedXAxisLabel}
        readingType={readingType}
      />
    );
  }
};

SensorReadingsLineChart.propTypes = {
  locationIds: PropTypes.array.isRequired,
  readingType: PropTypes.string.isRequired,
  noDataText: PropTypes.string.isRequired,
  activeReadingTypes: PropTypes.array.isRequired,
  noDataFoundMessage: PropTypes.string.isRequired,
};

export default SensorReadingsLineChart;
