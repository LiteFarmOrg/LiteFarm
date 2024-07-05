import { getUnitOptionMap } from './getUnitOptionMap';
import { convert } from './convert';

const METRIC = 'metric';
const IMPERIAL = 'imperial';
/**
 * seeding_rate: kg/m2
 */
// DO NOT CHANGE!
// Any change to this will lead to need for database backfilling.
const databaseUnit = {
  area: 'm2',
  length: 'm',
  mass: 'kg',
  volumeFlowRate: 'l/min',
  volume: 'l',
  time: 'min',
  degree: 'deg',
  temperature: 'C',
  pressure: 'kPa',
};

// These constants are used to determine units based on the guideline.
export const area_total_area = {
  metric: {
    units: ['m2', 'ha'],
    defaultUnit: 'm2',
    breakpoints: [1000],
  },
  imperial: {
    units: ['ft2', 'ac'],
    defaultUnit: 'ft2',
    breakpoints: [10890],
  },
  databaseUnit: databaseUnit.area,
};

export const area_perimeter = {
  metric: {
    units: ['m', 'km'],
    defaultUnit: 'm',
    breakpoints: [1000],
  },
  imperial: {
    units: ['ft', 'mi'],
    defaultUnit: 'ft',
    breakpoints: [1320],
  },
  databaseUnit: databaseUnit.length,
};

export const water_valve_flow_rate = {
  metric: {
    units: ['l/h', 'l/min'],
    defaultUnit: 'l/min',
    breakpoints: [60],
  },
  imperial: {
    units: ['gal/h', 'gal/min'],
    defaultUnit: 'gal/min',
    breakpoints: [1],
  },
  databaseUnit: databaseUnit.volumeFlowRate,
};

export const line_length = {
  metric: {
    units: ['m', 'km'],
    defaultUnit: 'm',
    breakpoints: [1000],
  },
  imperial: {
    units: ['ft', 'mi'],
    defaultUnit: 'ft',
    breakpoints: [1320],
  },
  databaseUnit: databaseUnit.length,
};

export const line_width = {
  metric: {
    units: ['m'],
    defaultUnit: 'm',
    breakpoints: [],
  },
  imperial: {
    units: ['ft'],
    defaultUnit: 'ft',
    breakpoints: [],
  },
  databaseUnit: databaseUnit.length,
};

export const watercourse_width = {
  metric: {
    units: ['m'],
    defaultUnit: 'm',
    breakpoints: [],
  },
  imperial: {
    units: ['ft'],
    defaultUnit: 'ft',
    breakpoints: [],
  },
  databaseUnit: databaseUnit.length,
};

export const container_planting_depth = {
  metric: {
    units: ['cm', 'm'],
    defaultUnit: 'cm',
    breakpoints: [100],
  },
  imperial: {
    units: ['in', 'ft'],
    defaultUnit: 'in',
    breakpoints: [12],
  },
  databaseUnit: databaseUnit.length,
};

export const irrigation_task_estimated_duration = {
  metric: {
    units: ['h', 'min'],
    defaultUnit: 'min',
    breakpoints: [60],
  },
  imperial: {
    units: ['h', 'min'],
    defaultUnit: 'min',
    breakpoints: [1],
  },
  databaseUnit: databaseUnit.time,
};

export const irrigation_depth = {
  metric: {
    units: ['mm'],
    defaultUnit: 'mm',
    breakpoints: [],
  },
  imperial: {
    units: ['in'],
    defaultUnit: 'in',
    breakpoints: [],
  },
  databaseUnit: databaseUnit.length,
};

export const location_area = {
  metric: {
    units: ['m2', 'ha'],
    defaultUnit: 'm2',
    breakpoints: [1000],
  },
  imperial: {
    units: ['ft2', 'ac'],
    defaultUnit: 'ft2',
    breakpoints: [10890],
  },
  databaseUnit: databaseUnit.area,
};
export const length_of_bed_or_row = {
  metric: {
    units: ['cm', 'm'],
    defaultUnit: 'm',
    breakpoints: [100],
  },
  imperial: {
    units: ['in', 'ft'],
    defaultUnit: 'ft',
    breakpoints: [12],
  },
  databaseUnit: databaseUnit.length,
};

export const container_plant_spacing = {
  metric: {
    units: ['cm', 'm'],
    defaultUnit: 'cm',
    breakpoints: [100],
  },
  imperial: {
    units: ['in', 'ft'],
    defaultUnit: 'in',
    breakpoints: [20],
  },
  databaseUnit: databaseUnit.length,
};

// crop_age is not stored in the database.
// databaseUnit is used for calculation.
export const crop_age = {
  metric: {
    units: ['d', 'week', 'month', 'year'],
    defaultUnit: 'week',
    breakpoints: [7, 30, 365],
  },
  imperial: {
    units: ['d', 'week', 'month', 'year'],
    defaultUnit: 'week',
    breakpoints: [7, 30, 365],
  },
  databaseUnit: 'd',
};

export const seedAmounts = {
  metric: {
    units: ['g', 'kg'],
    defaultUnit: 'g',
    breakpoints: [1000],
  },
  imperial: {
    units: ['oz', 'lb'],
    defaultUnit: 'oz',
    breakpoints: [16],
  },
  databaseUnit: databaseUnit.mass,
};

export const soilAmounts = {
  metric: {
    units: ['g', 'kg', 'mt'],
    defaultUnit: 'kg',
    breakpoints: [1, 1000],
  },
  imperial: {
    units: ['oz', 'lb', 't'],
    defaultUnit: 'lb',
    breakpoints: [16],
  },
  databaseUnit: databaseUnit.mass,
};

export const seedYield = {
  metric: {
    units: ['kg', 'mt'],
    defaultUnit: 'kg',
    breakpoints: [1000],
  },
  imperial: {
    units: ['lb', 't'],
    defaultUnit: 'lb',
    breakpoints: [2000],
  },
  databaseUnit: databaseUnit.mass,
};

export const pricePerSeedYield = {
  metric: {
    units: ['kg', 'mt'],
    defaultUnit: 'kg',
    breakpoints: [],
  },
  imperial: {
    units: ['lb', 't'],
    defaultUnit: 'lb',
    breakpoints: [],
  },
  databaseUnit: databaseUnit.mass,
  invertedUnit: true,
};

export const waterUsage = {
  metric: {
    units: ['ml', 'l'],
    defaultUnit: 'l',
    breakpoints: [1000],
  },
  imperial: {
    units: ['gal', 'fl-oz'],
    defaultUnit: 'gal',
    breakpoints: [128],
  },
  databaseUnit: databaseUnit.volume,
};

export const harvestAmounts = {
  metric: {
    units: ['kg', 'mt'],
    defaultUnit: 'kg',
    breakpoints: [1000],
  },
  imperial: {
    units: ['lb', 't'],
    defaultUnit: 'lb',
    breakpoints: [2000],
  },
  databaseUnit: databaseUnit.mass,
};

export const pest = {
  metric: {
    units: ['g', 'kg', 'mt'],
    defaultUnit: 'kg',
    breakpoints: [1, 1000],
  },
  imperial: {
    units: ['oz', 'lb', 't'],
    defaultUnit: 'lb',
    breakpoints: [1, 2000],
  },
  databaseUnit: databaseUnit.mass,
};

export const furrow_hole_depth = {
  metric: {
    units: ['cm'],
    defaultUnit: 'cm',
    breakpoints: [],
  },
  imperial: {
    units: ['in'],
    defaultUnit: 'in',
    breakpoints: [],
  },
  databaseUnit: databaseUnit.length,
};

//TODO move to storybook

const areaUnits = {
  metric: {
    units: ['m2', 'ha'],
    defaultUnit: 'm2',
    breakpoints: [1000],
  },
  imperial: {
    units: ['ft2', 'ac'],
    defaultUnit: 'ft2',
    breakpoints: [10890],
  },
  databaseUnit: databaseUnit.area,
};

const distanceUnits = {
  metric: {
    units: ['cm', 'm', 'km'],
    defaultUnit: 'm',
    breakpoints: [1, 1000],
  },
  imperial: {
    units: ['in', 'ft', 'mi'],
    defaultUnit: 'ft',
    breakpoints: [20, 1320],
  },
  databaseUnit: databaseUnit.length,
};

const massUnits = {
  metric: {
    units: ['g', 'kg', 'mt'],
    defaultUnit: 'kg',
    breakpoints: [1, 1000],
  },
  imperial: {
    units: ['oz', 'lb', 't'],
    defaultUnit: 'lb',
    breakpoints: [1, 2000],
  },
  databaseUnit: databaseUnit.mass,
};

const volumeFlowRateUnits = {
  metric: {
    units: ['l/h', 'l/min'],
    defaultUnit: 'l/h',
    breakpoints: [60],
  },
  imperial: {
    units: ['gal/h', 'gal/min'],
    defaultUnit: 'gal/min',
    breakpoints: [1],
  },
  databaseUnit: databaseUnit.volumeFlowRate,
};

export const ambientTemperature = {
  metric: {
    units: ['C'],
    defaultUnit: 'C',
    breakpoints: [],
  },
  imperial: {
    units: ['F'],
    defaultUnit: 'F',
    breakpoints: [],
  },
  databaseUnit: databaseUnit.temperature,
};

export const soilWaterPotential = {
  metric: {
    units: ['kPa'],
    defaultUnit: 'kPa',
    breakpoints: [],
  },
  imperial: {
    units: ['psi'],
    defaultUnit: 'psi',
    breakpoints: [],
  },
  databaseUnit: databaseUnit.pressure,
};

export const getDefaultUnit = (unitType = area_total_area, value, system, unit) => {
  if (value) {
    let displayValue;
    let displayUnit;
    const defaultDisplayUnit = unitType[system].defaultUnit;
    const from = unit ?? unitType.databaseUnit;
    const defaultDisplayValue =
      defaultDisplayUnit === from ? value : convertFn(unitType, value, from, defaultDisplayUnit);
    let i = 0;
    for (; i < unitType[system].breakpoints.length; i++) {
      if (defaultDisplayValue < unitType[system].breakpoints[i]) {
        displayUnit = unitType[system].units[i];
        displayValue =
          displayUnit === defaultDisplayUnit
            ? defaultDisplayValue
            : convert(value).from(from).to(displayUnit);
        return { displayUnit, displayValue: roundToTwoDecimal(displayValue) };
      }
    }
    displayUnit = unitType[system].units[i];
    displayValue =
      displayUnit === defaultDisplayUnit
        ? defaultDisplayValue
        : convertFn(unitType, value, from, displayUnit);
    return { displayUnit, displayValue: roundToTwoDecimal(displayValue) };
  } else {
    return { displayUnit: unitType[system].defaultUnit, displayValue: '' };
  }
};

export const roundToTwoDecimal = (number) => Math.round(number * 100) / 100;

export const getDurationInDaysDefaultUnit = (days) => {
  if (days % 365 === 0 && days >= 365) return getUnitOptionMap()['year'];
  if (days % 30 === 0 && days >= 30) return getUnitOptionMap()['month'];
  if (days % 7 === 0 && days >= 7) return getUnitOptionMap()['week'];
  return getUnitOptionMap()['d'];
};

/**
 * Selects convert function based on unitType.invertedUnit.
 * @param {object} unitType - Unit definition.
 * @param {number} value - Value to convert.
 * @param {string} from - Unit to convert from.
 * @param {string} to - Unit to convert to.
 * @returns {number} Converted value.
 */
export const convertFn = (unitType, value, from, to) => {
  return unitType.invertedUnit
    ? Math.pow(convert(Math.pow(value, -1)).from(from).to(to), -1)
    : convert(value).from(from).to(to);
};
