import { useEffect, useRef, useState } from 'react';
import { bulkSensorsReadingsSliceSelector } from '../../containers/bulkSensorReadingsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { weatherSelector } from '../../containers/WeatherBoard/weatherSlice';
import utils from '../../containers/WeatherBoard/utils';
import { getSensorsTempratureReadings } from '../../containers/SensorReadings/saga';
import { findCenter } from '../../containers/SensorReadings/utils';
import {
  AMBIENT_TEMPERATURE,
  colors,
  CURRENT_DATE_TIME,
} from '../../containers/SensorReadings/constants';

export function useReadingsLineChat(locationIds) {
  const bulkSensorsReadingsSliceSelectorData = useSelector(bulkSensorsReadingsSliceSelector);

  const { measurement } = useSelector(weatherSelector);
  const { tempUnit } = utils.getUnits(measurement);
  const dispatch = useDispatch();

  // const addAmbientTemperatureInfo = () => {
  //   const centerLatAndLong = findCenter(sensorsInfoList.map((s) => ({ lat: s.lat, lng: s.lon })));
  //   sensorsInfoList.push({
  //     sensor_name: 'Ambient temperature',
  //     lat: centerLatAndLong.lat,
  //     lon: centerLatAndLong.lng,
  //   });
  //   setSensorsInfoList(sensorsInfoList);
  // };

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
