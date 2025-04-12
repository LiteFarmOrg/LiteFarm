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
import i18n from '../locales/i18n';
import {
  adjustDailyDateTime,
  convertEsciReadingValue,
  degToDirection,
  formatDataPoint,
  formatSensorDatapoints,
  getAdjustHourlyDateTimeFunc,
  getReadingUnit,
} from '../containers/SensorReadings/v2/utils';
import { getUnixTime } from '../components/Charts/utils';
import { formatWindData } from '../containers/SensorReadings/v2/LatestReadings/utils';

const createData = (date) => {
  return { dateTime: getUnixTime(date) };
};

describe('Test chart data formatting', () => {
  test('adjustDailyDateTime shifts UTC midnight to intended local midnight', () => {
    const localMidnight = new Date(2025, 3, 1); // April 1, 2025 at 00:00 LOCAL
    const timestampFromAPI =
      Date.UTC(
        localMidnight.getUTCFullYear(),
        localMidnight.getUTCMonth(),
        localMidnight.getUTCDate(),
        0,
      ) / 1000;

    expect(adjustDailyDateTime(timestampFromAPI)).toBe(localMidnight.getTime() / 1000);
  });

  describe('getAdjustHourlyDateTimeFunc shifts UTC time to intended local time', () => {
    const testAdjustHourlyDateTime = (offsetMinutes) => {
      const adjust = getAdjustHourlyDateTimeFunc(offsetMinutes);

      const localDate = new Date(Date.UTC(2025, 3, 1, 10) - offsetMinutes * 60 * 1000); // April 1, 2025 at 10:00 LOCAL
      const timestampFromAPI =
        Date.UTC(
          localDate.getUTCFullYear(),
          localDate.getUTCMonth(),
          localDate.getUTCDate(),
          localDate.getUTCHours(),
          0,
        ) / 1000;

      expect(adjust(timestampFromAPI)).toBe(localDate.getTime() / 1000);
    };

    test('handles local time ahead of UTC (+5:30)', () => {
      const offsetMinutes = -330; // +5:30
      testAdjustHourlyDateTime(offsetMinutes);
    });

    test('handles local time behind UTC (-2:30)', () => {
      const offsetMinutes = 150; // -2:30
      testAdjustHourlyDateTime(offsetMinutes);
    });
  });

  test('formatDataPoint fills missing data with null correctly', () => {
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
      const result = formatDataPoint(data, ['key1', 'key2', 'key3']);
      expect(result).toEqual(expectedData[index]);
    });
  });

  describe('formatSensorDatapoints', () => {
    test('fills missing days correctly', () => {
      const fakeData = ['2025-03-01', '2025-03-03', '2025-03-06'].map(createData);
      const expectedData = [
        '2025-03-01',
        '2025-03-02',
        '2025-03-03',
        '2025-03-04',
        '2025-03-06',
      ].map(createData);
      const result = formatSensorDatapoints(fakeData, 'day', []);
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
      const result = formatSensorDatapoints(fakeData, 'day', []);
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
      const result = formatSensorDatapoints(fakeData, 'day', []);
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

      const result = formatSensorDatapoints(fakeData, 'hour', []);
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

      const result = formatSensorDatapoints(fakeData, 'hour', []);
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

  describe('degToDirection', () => {
    test('convert wind direction in degree to compass direction properly', () => {
      const validate = {
        N: (deg) => deg <= 11.25 || deg >= 348.75,
        NNE: (deg) => 11.25 < deg && deg <= 33.75,
        NE: (deg) => 33.75 < deg && deg <= 56.25,
        ENE: (deg) => 56.25 < deg && deg <= 78.75,
        E: (deg) => 78.75 < deg && deg <= 101.25,
        ESE: (deg) => 101.25 < deg && deg <= 123.75,
        SE: (deg) => 123.75 < deg && deg <= 146.25,
        SSE: (deg) => 146.25 < deg && deg <= 168.75,
        S: (deg) => 168.75 < deg && deg <= 191.25,
        SSW: (deg) => 191.25 < deg && deg <= 213.75,
        SW: (deg) => 213.75 < deg && deg <= 236.25,
        WSW: (deg) => 236.25 < deg && deg <= 258.75,
        W: (deg) => 258.75 < deg && deg <= 281.25,
        WNW: (deg) => 281.25 < deg && deg <= 303.75,
        NW: (deg) => 303.75 < deg && deg <= 326.25,
        NNW: (deg) => 326.25 < deg && deg <= 348.75,
      };

      for (let deg = 0; deg < 360; deg++) {
        const direction = degToDirection(deg);
        expect(validate[direction](deg)).toBe(true);
      }
    });
  });

  describe('formatWindData', () => {
    const mockSpeedReadings = {
      reading_type: 'wind_speed',
      unit: 'm/s',
      readings: [
        { dateTime: 1717200000, testId: 2 },
        { dateTime: 1717286400, testId: 2.5 },
      ],
    };
    const mockDirectionReadings = {
      reading_type: 'wind_direction',
      unit: 'deg',
      readings: [
        { dateTime: 1717200000, testId: 10 },
        { dateTime: 1717286400, testId: 20 },
      ],
    };
    const mockSensor = { external_id: 'testId' };

    test('format properly with only wind speed', () => {
      ['metric', 'imperial'].forEach((system) => {
        const { label, data } = formatWindData(
          mockSensor,
          { wind_speed: mockSpeedReadings },
          system,
          i18n.t,
        );
        expect(label).toBe(i18n.t('SENSOR.READING.WIND_SPEED'));
        expect(data).toBe(system === 'metric' ? '9km/h' : '5.59mph');
      });
    });

    test('format properly with only wind direction', () => {
      const { label, data } = formatWindData(
        mockSensor,
        { wind_direction: mockDirectionReadings },
        'metric',
        i18n.t,
      );
      expect(label).toBe(i18n.t('SENSOR.READING.WIND_DIRECTION'));
      expect(JSON.stringify(data)).toContain('"directionText":"NNE"');
    });

    test('format properly with both wind speed and direction', () => {
      ['metric', 'imperial'].forEach((system) => {
        const { label, data } = formatWindData(
          mockSensor,
          { wind_speed: mockSpeedReadings, wind_direction: mockDirectionReadings },
          system,
          i18n.t,
        );
        expect(label).toBe(i18n.t('SENSOR.READING.WIND_SPEED_AND_DIRECTION'));
        expect(JSON.stringify(data)).toContain(
          `"speed":"${system === 'metric' ? '9km/h' : '5.59mph'}"`,
        );
        expect(JSON.stringify(data)).toContain('"directionText":"NNE"');
      });
    });

    test('handle case when no wind speed or direction data', () => {
      const result = formatWindData(mockSensor, { temperature: {} }, 'metric', i18n.t);
      expect(result).toBe(undefined);
    });

    test('handle case when the latest data is missing', () => {
      const speedWithoutReadings = { ...mockSpeedReadings, readings: [] };
      const dataMissingSpeed = formatWindData(
        mockSensor,
        { wind_speed: speedWithoutReadings, wind_direction: mockDirectionReadings },
        'metric',
        i18n.t,
      );
      expect(dataMissingSpeed.label).toBe(i18n.t('SENSOR.READING.WIND_SPEED_AND_DIRECTION'));
      expect(JSON.stringify(dataMissingSpeed.data)).toContain('"speed":"-"');
      expect(JSON.stringify(dataMissingSpeed.data)).toContain('"directionText":"NNE"');

      const directionWithoutReadings = { ...mockDirectionReadings, readings: [] };
      const dataMissingDirection = formatWindData(
        mockSensor,
        { wind_speed: mockSpeedReadings, wind_direction: directionWithoutReadings },
        'metric',
        i18n.t,
      );
      expect(dataMissingDirection.label).toBe(i18n.t('SENSOR.READING.WIND_SPEED_AND_DIRECTION'));
      expect(JSON.stringify(dataMissingDirection.data)).toContain('"speed":"9km/h"');
      expect(JSON.stringify(dataMissingDirection.data)).toContain('"directionText":"-"');

      const dataMissingSpeedAndDirection = formatWindData(
        mockSensor,
        { wind_speed: speedWithoutReadings, wind_direction: directionWithoutReadings },
        'metric',
        i18n.t,
      );
      expect(dataMissingSpeedAndDirection.label).toBe(
        i18n.t('SENSOR.READING.WIND_SPEED_AND_DIRECTION'),
      );
      expect(dataMissingSpeedAndDirection.data).toBe('-');
    });
  });
});
