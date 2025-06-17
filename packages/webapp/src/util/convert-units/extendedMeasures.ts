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

import { Measure } from 'convert-units';

import speed, { SpeedSystems, SpeedUnits } from 'convert-units/lib/esm/definitions/speed';

import volume, { VolumeSystems, VolumeUnits } from 'convert-units/lib/esm/definitions/volume';

// Extending measures: https://github.com/convert-units/convert-units?tab=readme-ov-file#extending-existing-measures

// Extending Speed
export type EvapotranspirationRateUnits = 'mm/h' | 'in/d';

type NewSpeedUnits = SpeedUnits | EvapotranspirationRateUnits;
export const extendedSpeed: Measure<SpeedSystems, NewSpeedUnits> = {
  systems: {
    metric: {
      ...speed.systems.metric,
    },
    imperial: {
      ...speed.systems.imperial,
      'in/d': {
        name: {
          singular: 'Inch per Day',
          plural: 'Inches per Day',
        },
        to_anchor: (1 / 63360) * (1 / 24), // mile/in * d/h
      },
    },
  },
  anchors: {
    ...speed.anchors,
  },
};

// Extending Volume
export type WaterConsumptionUnits = 'l' | 'ac⋅ft';

type NewVolumeUnits = VolumeUnits | WaterConsumptionUnits;
export const extendedVolume: Measure<VolumeSystems, NewVolumeUnits> = {
  systems: {
    metric: {
      ...volume.systems.metric,
    },
    imperial: {
      ...volume.systems.imperial,
      'ac⋅ft': {
        name: {
          singular: 'Acre-Foot',
          plural: 'Acre-Feet',
        },
        to_anchor: 41708982.857143,
      },
    },
  },
  anchors: {
    ...volume.anchors,
  },
};
