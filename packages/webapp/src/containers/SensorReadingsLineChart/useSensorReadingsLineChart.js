import { useEffect } from 'react';
import { bulkSensorsReadingsSliceSelector } from '../bulkSensorReadingsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { weatherSelector } from '../WeatherBoard/weatherSlice';
import utils from '../WeatherBoard/utils';
import { getSensorsReadings } from '../SensorReadings/saga';

import {
  AMBIENT_TEMPERATURE,
  CHART_LINE_COLORS,
  CURRENT_DATE_TIME,
} from '../SensorReadings/constants';

export function useSensorReadingsLineChart(locationIds, readingType) {
  const bulkSensorsReadingsSliceSelectorData = useSelector(bulkSensorsReadingsSliceSelector);

  const { measurement } = useSelector(weatherSelector);
  const { tempUnit } = utils.getUnits(measurement);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSensorsReadings(locationIds, readingType));
  }, []);

  const getYAxisDataKeys = () => {
    if (bulkSensorsReadingsSliceSelectorData?.sensorsReadingsOfTemperature.length) {
      const readingsObj = bulkSensorsReadingsSliceSelectorData?.sensorsReadingsOfTemperature[0];
      const yAxisFields = Object.keys(readingsObj)
        .filter((f) => f !== CURRENT_DATE_TIME && !f.includes(AMBIENT_TEMPERATURE))
        .sort();
      const ambientKey = Object.keys(readingsObj).find((f) => f.includes(AMBIENT_TEMPERATURE));
      return [...yAxisFields, ambientKey];
    } else {
      return [];
    }
  };

  return {
    sensorsReadingsOfTemperature:
      bulkSensorsReadingsSliceSelectorData?.sensorsReadingsOfTemperature,
    yAxisDataKeys: getYAxisDataKeys(),
    lineColors: CHART_LINE_COLORS,
    tempUnit,
  };
}
