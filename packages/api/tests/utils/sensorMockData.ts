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

export const mockedEnsembleReadingsData = {
  '111': {
    device_esid: 'TESTID1',
    data: [
      {
        parameter_category: 'Soil Water Potential',
        unit: 'kPa',
        timestamps: [
          '2025-03-01 00:00:00+00:00',
          '2025-03-03 00:00:00+00:00',
          '2025-03-05 00:00:00+00:00',
        ],
        values: [-195.28161305919332, -191.6663959922129, -195.55571467808315],
        validated: [true, true, true],
      },
      {
        parameter_category: 'Temperature',
        unit: '°C',
        timestamps: [
          '2025-03-01 00:00:00+00:00',
          '2025-03-03 00:00:00+00:00',
          '2025-03-05 00:00:00+00:00',
        ],
        values: [10.173165954415955, 9.556268063583815, 10.198482142857143],
        validated: [true, true, true],
      },
    ],
  },
  '222': {
    device_esid: 'TESTID2',
    data: [
      {
        parameter_category: 'Soil Water Potential',
        unit: 'kPa',
        timestamps: [
          '2025-02-28 00:00:00+00:00',
          '2025-03-01 00:00:00+00:00',
          '2025-03-03 00:00:00+00:00',
        ],
        values: [-200.123456789, -210.987654321, -215.123789456],
        validated: [true, true, true],
      },
      {
        parameter_category: 'Temperature',
        unit: '°C',
        timestamps: [
          '2025-02-28 00:00:00+00:00',
          '2025-03-01 00:00:00+00:00',
          '2025-03-03 00:00:00+00:00',
        ],
        values: [11.23456789, 12.987654321, 13.123789456],
        validated: [true, true, true],
      },
    ],
  },
};

export const mockedFormattedReadingsData = [
  {
    reading_type: 'soil_water_potential',
    unit: 'kPa',
    readings: [
      {
        dateTime: 1740700800,
        TESTID2: -200.123456789,
      },
      {
        dateTime: 1740787200,
        TESTID1: -195.28161305919332,
        TESTID2: -210.987654321,
      },
      {
        dateTime: 1740960000,
        TESTID1: -191.6663959922129,
        TESTID2: -215.123789456,
      },
      {
        dateTime: 1741132800,
        TESTID1: -195.55571467808315,
      },
    ],
  },
  {
    reading_type: 'temperature',
    unit: 'C',
    readings: [
      {
        dateTime: 1740700800,
        TESTID2: 11.23456789,
      },
      {
        dateTime: 1740787200,
        TESTID1: 10.173165954415955,
        TESTID2: 12.987654321,
      },
      {
        dateTime: 1740960000,
        TESTID1: 9.556268063583815,
        TESTID2: 13.123789456,
      },
      {
        dateTime: 1741132800,
        TESTID1: 10.198482142857143,
      },
    ],
  },
];
