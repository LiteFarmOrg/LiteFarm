import convert from 'convert-units';

const METRIC = 'metric';
const IMPERIAL = 'imperial';

const databaseUnit = {
  area: 'm2',
  length: 'm',
  mass: 'kg',
  volumeFlowRate: 'l/min',
};

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

const seedAmounts = {
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

export const getDefaultUnit = (unitType = area_total_area, value, system, unit) => {
  if (value) {
    let displayValue;
    let displayUnit;
    const defaultDisplayUnit = unitType[system].defaultUnit;
    const from = unit ?? unitType.databaseUnit;
    const defaultDisplayValue =
      defaultDisplayUnit === from ? value : convert(value).from(from).to(defaultDisplayUnit);
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
        : convert(value).from(from).to(displayUnit);
    return { displayUnit, displayValue: roundToTwoDecimal(displayValue) };
  } else {
    return { displayUnit: unitType[system].defaultUnit, displayValue: undefined };
  }
};

export const roundToTwoDecimal = (number) => Math.round(number * 100) / 100;
