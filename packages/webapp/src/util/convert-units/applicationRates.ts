/*
 *  Copyright 2024 LiteFarm.org
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

export type ApplicationRateVolumeUnits =
  | 'l/ha'
  | 'ml/ha'
  | 'l/m2'
  | 'ml/m2'
  | 'gal/ac'
  | 'gal/ft2'
  | 'fl-oz/ft2'
  | 'fl-oz/ac';

export type ApplicationRateWeightUnits =
  | 'kg/ha'
  | 'g/ha'
  | 'mt/ha'
  | 'g/m2'
  | 'kg/m2'
  | 'mt/m2'
  | 'lb/ac'
  | 'lb/ft2'
  | 'oz/ft2'
  | 't/ft2'
  | 'oz/ac'
  | 't/ac';

// Custom measures; https://github.com/convert-units/convert-units?tab=readme-ov-file#custom-measures
export const applicationRateVolume: Measure<'metric' | 'imperial', ApplicationRateVolumeUnits> = {
  systems: {
    metric: {
      'l/ha': {
        name: {
          singular: 'Liter per Hectare',
          plural: 'Liters per Hectare',
        },
        to_anchor: 1,
      },
      'ml/ha': {
        name: {
          singular: 'Milliliter per Hectare',
          plural: 'Milliliters per Hectare',
        },
        to_anchor: 0.001,
      },
      'l/m2': {
        name: {
          singular: 'Liter per Square Meter',
          plural: 'Liters per Square Meter',
        },
        to_anchor: 1 * 10000, // volume to volume conversion x reciprocal of area-to-area conversion
      },
      'ml/m2': {
        name: {
          singular: 'Milliliter per Square Meter',
          plural: 'Milliliters per Square Meter',
        },
        to_anchor: 0.001 * 10000,
      },
    },
    imperial: {
      'gal/ac': {
        name: {
          singular: 'Gallon per Acre',
          plural: 'Gallons per Acre',
        },
        to_anchor: 1,
      },
      'gal/ft2': {
        name: {
          singular: 'Gallon per Square Foot',
          plural: 'Gallons per Square Foot',
        },
        to_anchor: 1 * 43560, // volume-to-volume conversion x reciprocal of area-to-area conversion
      },
      'fl-oz/ft2': {
        name: {
          singular: 'Fluid Ounce per Square Foot',
          plural: 'Fluid Ounces per Square Foot',
        },
        to_anchor: (1 / 128) * 43560,
      },
      'fl-oz/ac': {
        name: {
          singular: 'Fluid Ounce per Acre',
          plural: 'Fluid Ounces per Acre',
        },
        to_anchor: 1 / 128,
      },
    },
  },
  anchors: {
    metric: {
      imperial: {
        ratio: 0.264172 / 2.47105, // l/gal * (ac/ha)
      },
    },
    imperial: {
      metric: {
        ratio: 3.78541 * 2.47105, // gal/l * (ha/ac)
      },
    },
  },
};

export const applicationRateWeight: Measure<'metric' | 'imperial', ApplicationRateWeightUnits> = {
  systems: {
    metric: {
      'kg/ha': {
        name: {
          singular: 'Kilogram per Hectare',
          plural: 'Kilograms per Hectare',
        },
        to_anchor: 1,
      },
      'g/ha': {
        name: {
          singular: 'Gram per Hectare',
          plural: 'Grams per Hectare',
        },
        to_anchor: 0.001,
      },
      'mt/ha': {
        name: {
          singular: 'Metric Ton per Hectare',
          plural: 'Metric Tons per Hectare',
        },
        to_anchor: 1000,
      },
      'g/m2': {
        name: {
          singular: 'Gram per Square Meter',
          plural: 'Grams per Square Meter',
        },
        to_anchor: 0.001 * 10000, // mass-to-mass conversion x reciprocal of area-to-area conversion
      },
      'kg/m2': {
        name: {
          singular: 'Kilogram per Square Meter',
          plural: 'Kilograms per Square Meter',
        },
        to_anchor: 1 * 10000,
      },
      'mt/m2': {
        name: {
          singular: 'Metric Ton per Square Meter',
          plural: 'Metric Tons per Square Meter',
        },
        to_anchor: 1000 * 10000,
      },
    },
    imperial: {
      'lb/ac': {
        name: {
          singular: 'Pound per Acre',
          plural: 'Pounds per Acre',
        },
        to_anchor: 1,
      },
      'lb/ft2': {
        name: {
          singular: 'Pound per Square Foot',
          plural: 'Pounds per Square Foot',
        },
        to_anchor: 43560,
      },
      'oz/ft2': {
        name: {
          singular: 'Ounce per Square Foot',
          plural: 'Ounces per Square Foot',
        },
        to_anchor: (1 / 16) * 43560, // mass-to-mass conversion x reciprocal of area-to-area conversion
      },
      't/ft2': {
        name: {
          singular: 'Ton per Square Foot',
          plural: 'Tons per Square Foot',
        },
        to_anchor: 2000 * 43560,
      },
      'oz/ac': {
        name: {
          singular: 'Ounce per Acre',
          plural: 'Ounces per Acre',
        },
        to_anchor: 1 / 16,
      },
      't/ac': {
        name: {
          singular: 'Ton per Acre',
          plural: 'Tons per Acre',
        },
        to_anchor: 2000,
      },
    },
  },
  anchors: {
    metric: {
      imperial: {
        ratio: 2.20462 / 2.47105, // kg/lb * (ac/ha)
      },
    },
    imperial: {
      metric: {
        ratio: (1 / 2.20462) * 2.47105, // lbs/kg * (ha/ac)
      },
    },
  },
};
