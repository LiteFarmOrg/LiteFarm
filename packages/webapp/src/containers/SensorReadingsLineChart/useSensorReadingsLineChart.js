import { useEffect, useRef, useState } from 'react';
import { bulkSensorsReadingsSliceSelector } from '../bulkSensorReadingsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { weatherSelector } from '../WeatherBoard/weatherSlice';
import utils from '../WeatherBoard/utils';
import { getSensorsTempratureReadings } from '../SensorReadings/saga';

import { AMBIENT_TEMPERATURE, colors, CURRENT_DATE_TIME } from '../SensorReadings/constants';

export function useSensorReadingsLineChart(locationIds) {
  const bulkSensorsReadingsSliceSelectorData = useSelector(bulkSensorsReadingsSliceSelector);

  const { measurement } = useSelector(weatherSelector);
  const { tempUnit } = utils.getUnits(measurement);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSensorsTempratureReadings(locationIds));
  }, []);

  const getYAxisDataKeys = () => {
    if (bulkSensorsReadingsSliceSelectorData?.sensorsReadingsOfTemperature.length) {
      const yAxisFields = Object.keys(
        bulkSensorsReadingsSliceSelectorData?.sensorsReadingsOfTemperature[0],
      )
        .filter((f) => f !== CURRENT_DATE_TIME && f !== AMBIENT_TEMPERATURE)
        .sort();
      return [...yAxisFields, AMBIENT_TEMPERATURE];
    } else {
      return [];
    }
  };

  return {
    sensorsReadingsOfTemperature:
      bulkSensorsReadingsSliceSelectorData?.sensorsReadingsOfTemperature,
    yAxisDataKeys: getYAxisDataKeys(),
    lineColors: colors,
    tempUnit,
  };
}
