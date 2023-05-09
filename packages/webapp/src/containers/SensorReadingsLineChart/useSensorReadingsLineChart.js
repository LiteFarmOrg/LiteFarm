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

  const [labels, setLabels] = useState({});

  const { latestMaxTemperature, latestMinTemperature, nearestStationName } = data;

  useEffect(() => {
    setLabels(
      getLabels(readingType, latestMaxTemperature, latestMinTemperature, nearestStationName),
    );
  }, [readingType, latestMaxTemperature, latestMinTemperature, nearestStationName]);

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

  const getLabels = (readingType) => {
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
      };
    }
    if (readingType === SOIL_WATER_POTENTIAL) {
      return {
        title: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.TITLE'),
        yAxisLabel: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
          units: getUnitOptionMap()[soilWaterPotential[unitSystem].defaultUnit].label,
        }),
      };
    }
    if (readingType === SOIL_WATER_CONTENT) {
      return {
        title: t('SENSOR.SOIL_WATER_CONTENT_READINGS_OF_SENSOR.TITLE'),
        yAxisLabel: t('SENSOR.SOIL_WATER_CONTENT_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
          units: '%',
        }),
      };
    }
  };

  return {
    sensorsReadings: data?.sensorsReadings[readingType],
    yAxisDataKeys: getYAxisDataKeys(),
    lineColors: CHART_LINE_COLORS,
    loading: data?.loading,

    weatherStationName: data?.nearestStationName,
    predictedXAxisLabel: data?.predictedXAxisLabel,
    xAxisLabel: data?.xAxisLabel,
    labels,
    xAxisDataKey: CURRENT_DATE_TIME,
    lastUpdatedReadings: data?.lastUpdatedReadingsTime[readingType]
      ? t('SENSOR.LAST_UPDATED', {
          latestReadingUpdate: data?.lastUpdatedReadingsTime[readingType],
        })
      : '',
  };
}
