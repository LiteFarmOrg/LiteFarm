import { useEffect, useState } from 'react';
import { bulkSensorsReadingsSliceSelector } from '../bulkSensorReadingsSlice';
import { useSelector } from 'react-redux';
import { ambientTemperature, soilWaterPotential } from '../../util/convert-units/unit';
import { getUnitOptionMap } from '../../util/convert-units/getUnitOptionMap';
import {
  AMBIENT_TEMPERATURE,
  CHART_LINE_COLORS,
  CURRENT_DATE_TIME,
  SOIL_WATER_POTENTIAL,
  SOIL_WATER_CONTENT,
  TEMPERATURE,
} from '../SensorReadings/constants';
import { measurementSelector } from '../../containers/userFarmSlice';
import { useTranslation } from 'react-i18next';

export function useSensorReadingsLineChart(readingType) {
  const { t } = useTranslation();

  const unitSystem = useSelector(measurementSelector);
  const data = useSelector(bulkSensorsReadingsSliceSelector);

  const [chartLabels, setChartLabels] = useState({});
  const [chartData, setChartData] = useState({});
  const {
    latestMaxTemperature,
    latestMinTemperature,
    nearestStationName,
    xAxisLabel,
    predictedXAxisLabel,
    lastUpdatedReadingsTime,
    loading,
  } = data;

  useEffect(() => {
    if (readingType) {
      setChartLabels(
        getChartLabels(
          readingType,
          latestMaxTemperature,
          latestMinTemperature,
          nearestStationName,
          xAxisLabel,
          predictedXAxisLabel,
          lastUpdatedReadingsTime,
        ),
      );
    }
  }, [
    readingType,
    latestMaxTemperature,
    latestMinTemperature,
    nearestStationName,
    lastUpdatedReadingsTime,
  ]);

  useEffect(() => {
    if (data) {
      setChartData(getChartData(data));
    }
  }, [data]);

  const getYAxisDataKeys = () => {
    if (data?.sensorsReadings[readingType]?.length) {
      const readingsObj = data?.sensorsReadings[readingType][0];
      const yAxisFields = Object.keys(readingsObj)
        .filter((f) => f !== CURRENT_DATE_TIME && !f.includes(AMBIENT_TEMPERATURE))
        .sort();
      const ambientKey = Object.keys(readingsObj).find((f) => f.includes(AMBIENT_TEMPERATURE));
      return ambientKey ? [...yAxisFields, ambientKey] : yAxisFields;
    } else {
      return [];
    }
  };

  const getChartLabels = (readingType) => {
    if (readingType === TEMPERATURE) {
      return {
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
        xAxisLabel: xAxisLabel[readingType],
        predictedXAxisLabel: predictedXAxisLabel,
        lastUpdatedReadings: lastUpdatedReadingsTime[readingType],
      };
    }
    if (readingType === SOIL_WATER_POTENTIAL) {
      return {
        title: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.TITLE'),
        yAxisLabel: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
          units: getUnitOptionMap()[soilWaterPotential[unitSystem].defaultUnit].label,
        }),
        xAxisLabel: xAxisLabel[readingType],
        predictedXAxisLabel: predictedXAxisLabel,
        lastUpdatedReadings: lastUpdatedReadingsTime[readingType],
      };
    }
    if (readingType === SOIL_WATER_CONTENT) {
      return {
        title: t('SENSOR.SOIL_WATER_CONTENT_READINGS_OF_SENSOR.TITLE'),
        yAxisLabel: t('SENSOR.SOIL_WATER_CONTENT_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
          units: '%',
        }),
        xAxisLabel: xAxisLabel[readingType],
        predictedXAxisLabel: predictedXAxisLabel,
        lastUpdatedReadings: lastUpdatedReadingsTime[readingType],
      };
    }
  };

  const getChartData = (data) => {
    return {
      sensorsReadings: data.sensorsReadings[readingType],
      yAxisDataKeys: getYAxisDataKeys(),
      lineColors: CHART_LINE_COLORS,
      xAxisDataKey: CURRENT_DATE_TIME,
    };
  };
  return {
    loading,
    chartLabels,
    chartData,
  };
}
