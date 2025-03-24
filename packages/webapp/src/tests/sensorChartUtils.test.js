/*
 *  Copyright 2025 LiteFarm.org
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

import { expect, describe, test } from 'vitest';
import { getUnixTime } from '../components/Charts/utils';
import {
  convertEsciReadingValue,
  fillMissingDataWithNull,
  formatSensorsData,
  getReadingUnit,
  sortDataByDateTime,
} from '../containers/SensorReadings/v2/utils';

const createData = (date) => {
  return { dateTime: getUnixTime(date) };
};

describe('Test chart data formatting', () => {
  test('sortDataByDateTime sorts by dateTime correctly', () => {
    const fakeData = ['2025-03-01', '2025-02-28', '2025-03-06'].map(createData);
    const result = sortDataByDateTime(fakeData);
    expect(result).toEqual(['2025-02-28', '2025-03-01', '2025-03-06'].map(createData));
  });

  test('fillMissingDataWithNull fills missing data with null correctly', () => {
    const fakeData = [
      { dateTime: 1717200000, key1: 10, key2: 20, key3: 30 },
      { dateTime: 1717286400, key1: 10 },
      { dateTime: 1717372800, key2: 20 },
      { dateTime: 1717459200, key3: 30 },
      { dateTime: 1717545600, key1: 10, key2: 20 },
      { dateTime: 1717632000, key1: 10, key3: 30 },
      { dateTime: 1717718400, key2: 20, key3: 30 },
    ];
    const expectedData = [
      { dateTime: 1717200000, key1: 10, key2: 20, key3: 30 },
      { dateTime: 1717286400, key1: 10, key2: null, key3: null },
      { dateTime: 1717372800, key1: null, key2: 20, key3: null },
      { dateTime: 1717459200, key1: null, key2: null, key3: 30 },
      { dateTime: 1717545600, key1: 10, key2: 20, key3: null },
      { dateTime: 1717632000, key1: 10, key2: null, key3: 30 },
      { dateTime: 1717718400, key1: null, key2: 20, key3: 30 },
    ];
    fakeData.forEach((data, index) => {
      const result = fillMissingDataWithNull(data, ['key1', 'key2', 'key3']);
      expect(result).toEqual(expectedData[index]);
    });
  });

  describe('formatSensorsData', () => {
    test('fills missing days correctly', () => {
      const fakeData = ['2025-03-01', '2025-03-03', '2025-03-06'].map(createData);
      const expectedData = [
        '2025-03-01',
        '2025-03-02',
        '2025-03-03',
        '2025-03-04',
        '2025-03-06',
      ].map(createData);
      const result = formatSensorsData(fakeData, 'day', []);
      expect(result).toEqual(expectedData);
    });

    test('handles data across months correctly', () => {
      const fakeData = ['2025-02-26', '2025-03-01', '2025-03-02', '2025-03-04'].map(createData);
      const expectedData = [
        '2025-02-26',
        '2025-02-27',
        '2025-03-01',
        '2025-03-02',
        '2025-03-03',
        '2025-03-04',
      ].map(createData);
      const result = formatSensorsData(fakeData, 'day', []);
      expect(result).toEqual(expectedData);
    });

    test('handles timestamps within the same day correctly', () => {
      const fakeData = ['2025-02-26', '2025-03-01', '2025-03-02', '2025-03-04'].map(createData);

      const expectedData = [
        '2025-02-26',
        '2025-02-27',
        '2025-03-01',
        '2025-03-02',
        '2025-03-03',
        '2025-03-04',
      ].map(createData);
      const result = formatSensorsData(fakeData, 'day', []);
      expect(result).toEqual(expectedData);
    });

    test('handles truncPeriod "hour" correctly', () => {
      const fakeData = [
        '2025-03-01T00:00:00Z',
        '2025-03-01T02:00:00Z',
        '2025-03-01T03:00:00Z',
        '2025-03-01T05:00:00Z',
      ].map(createData);
      const expectedData = [
        '2025-03-01T00:00:00Z',
        '2025-03-01T01:00:00Z',
        '2025-03-01T02:00:00Z',
        '2025-03-01T03:00:00Z',
        '2025-03-01T04:00:00Z',
        '2025-03-01T05:00:00Z',
      ].map(createData);

      const result = formatSensorsData(fakeData, 'hour', []);
      expect(result).toEqual(expectedData);
    });

    test('handles truncPeriod "hour" correctly with time difference', () => {
      const fakeData = [
        '2025-03-01T00:15:00Z',
        '2025-03-01T02:15:00Z',
        '2025-03-01T03:15:00Z',
        '2025-03-01T05:15:00Z',
      ].map(createData);
      const expectedData = [
        '2025-03-01T00:15:00Z',
        '2025-03-01T01:15:00Z',
        '2025-03-01T02:15:00Z',
        '2025-03-01T03:15:00Z',
        '2025-03-01T04:15:00Z',
        '2025-03-01T05:15:00Z',
      ].map(createData);

      const result = formatSensorsData(fakeData, 'hour', []);
      expect(result).toEqual(expectedData);
    });
  });

  describe('getUnit', () => {
    test('get a proper display unit', () => {
      [
        ['barometric_pressure', 'hPa', 'hPa', 'hPa'],
        ['cumulative_rainfall', 'mm', 'mm', 'in'],
        ['rainfall_rate', 'mm/h', 'mm/h', 'in/h'],
        ['relative_humidity', '%', '%', '%'],
        ['soil_water_potential', 'kPa', 'kPa', 'kPa'],
        ['solar_radiation', 'W/m2', 'W/m2', 'W/m2'],
        ['temperature', 'C', '°C', '°F'],
        ['wind_direction', 'deg', '°', '°'],
        ['wind_speed', 'm/s', 'km/h', 'mph'],
      ].forEach(([param, apiUnit, expecteMetricUnit, expecteImperialUnit]) => {
        const metricUnit = getReadingUnit(param, 'metric', apiUnit);
        const imperialUnit = getReadingUnit(param, 'imperial', apiUnit);

        expect(metricUnit).toBe(expecteMetricUnit);
        expect(imperialUnit).toBe(expecteImperialUnit);
      });
    });
  });

  describe('convertEsciReadingValue', () => {
    test('convert reading values properly', () => {
      [
        ['barometric_pressure', 8, 8, 8],
        ['cumulative_rainfall', 20, 20, 0.79],
        ['rainfall_rate', 2, 2, 0.08],
        ['relative_humidity', 33, 33, 33],
        ['soil_water_potential', -210, -210, -210],
        ['solar_radiation', 20, 20, 20],
        ['temperature', 23, 23, 73.4],
        ['wind_direction', 11, 11, 11],
        ['wind_speed', 2.22, 7.99, 4.97],
      ].forEach(([param, apiValue, expecteMetricValue, expecteImperialValue]) => {
        const metricValue = convertEsciReadingValue(apiValue, param, 'metric');
        const imperialValue = convertEsciReadingValue(apiValue, param, 'imperial');

        expect(metricValue).toBe(expecteMetricValue);
        expect(imperialValue).toBe(expecteImperialValue);
      });
    });
  });
});
