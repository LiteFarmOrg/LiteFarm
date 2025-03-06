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
import {
  fillMissingDataWithNull,
  formatSensorsData,
  getUnixTime,
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
        '2025-03-05',
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
        '2025-02-28',
        '2025-03-01',
        '2025-03-02',
        '2025-03-03',
        '2025-03-04',
      ].map(createData);
      const result = formatSensorsData(fakeData, 'day', []);
      expect(result).toEqual(expectedData);
    });

    test('handles timestamps within the same day correctly', () => {
      const fakeData = [
        '2025-02-26',
        '2025-03-01',
        '2025-03-01T00:44:52.876Z',
        '2025-03-01T02:44:52.876Z',
        '2025-03-02',
        '2025-03-04',
      ].map(createData);

      const expectedData = [
        '2025-02-26',
        '2025-02-27',
        '2025-02-28',
        '2025-03-01',
        '2025-03-01T00:44:52.876Z',
        '2025-03-01T02:44:52.876Z',
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
        '2025-03-01T02:30:00Z',
        '2025-03-01T03:30:00Z',
        '2025-03-01T05:30:00Z',
      ].map(createData);
      const expectedData = [
        '2025-03-01T00:00:00Z',
        '2025-03-01T01:00:00Z',
        '2025-03-01T02:00:00Z',
        '2025-03-01T02:30:00Z',
        '2025-03-01T03:00:00Z',
        '2025-03-01T03:30:00Z',
        '2025-03-01T04:00:00Z',
        '2025-03-01T05:00:00Z',
        '2025-03-01T05:30:00Z',
      ].map(createData);

      const result = formatSensorsData(fakeData, 'hour', []);
      expect(result).toEqual(expectedData);
    });
  });
});
