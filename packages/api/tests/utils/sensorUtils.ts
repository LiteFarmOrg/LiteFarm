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
    device_esid: 'TESTID',
    data: [
      {
        parameter_category: 'Soil Water Potential',
        unit: 'kPa',
        timestamps: [
          '2025-02-28 00:00:00+00:00',
          '2025-03-01 00:00:00+00:00',
          '2025-03-02 00:00:00+00:00',
          '2025-03-03 00:00:00+00:00',
          '2025-03-04 00:00:00+00:00',
        ],
        values: [
          -195.28161305919332, -191.6663959922129, -195.55571467808315, -206.86878244614977,
          -199.09718062660912,
        ],
        validated: [true, true, true, true, true],
      },
      {
        parameter_category: 'Temperature',
        unit: '°C',
        timestamps: [
          '2025-02-28 00:00:00+00:00',
          '2025-03-01 00:00:00+00:00',
          '2025-03-02 00:00:00+00:00',
          '2025-03-03 00:00:00+00:00',
          '2025-03-04 00:00:00+00:00',
        ],
        values: [
          10.173165954415955, 9.556268063583815, 10.198482142857143, 11.992510699001427,
          10.780032467532468,
        ],
        validated: [true, true, true, true, true],
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
        TESTID: -195.28161305919332,
      },
      {
        dateTime: 1740787200,
        TESTID: -191.6663959922129,
      },
      {
        dateTime: 1740873600,
        TESTID: -195.55571467808315,
      },
      {
        dateTime: 1740960000,
        TESTID: -206.86878244614977,
      },
      {
        dateTime: 1741046400,
        TESTID: -199.09718062660912,
      },
    ],
  },
  {
    reading_type: 'temperature',
    unit: 'C',
    readings: [
      {
        dateTime: 1740700800,
        TESTID: 10.173165954415955,
      },
      {
        dateTime: 1740787200,
        TESTID: 9.556268063583815,
      },
      {
        dateTime: 1740873600,
        TESTID: 10.198482142857143,
      },
      {
        dateTime: 1740960000,
        TESTID: 11.992510699001427,
      },
      {
        dateTime: 1741046400,
        TESTID: 10.780032467532468,
      },
    ],
  },
];
