import convert from 'convert-units';

const METRIC = 'metric';
const IMPERIAL = 'imperial';
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
    breakpoints: [10, 1320],
  },
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
};

const getDefaultUnit = (unitType = areaUnits, value, system, from) => {
  let displayValue;
  let displayUnit;
  const defaultDisplayUnit = unitType[system].defaultUnit;
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
};

export const getDefaultDisplayAreaUnit = (value, system = METRIC, from = 'mm2') => {
  return getDefaultUnit(areaUnits, value, system, from);
};

export const getDefaultDisplayDistanceUnit = (value, system = METRIC, from = 'm') => {
  //TODO: If between 4 ft and 20 ft, show in feet and inches to the nearest inch
  return getDefaultUnit(distanceUnits, value, system, from);
};

export const getDefaultDisplayMassUnit = (value, system = METRIC, from = 'kg') => {
  return getDefaultUnit(massUnits, value, system, from);
};

export const roundToTwoDecimal = (number) => Math.round(number * 100) / 100;

const getDefaultDisplaySeedCountUnit = (value, system = METRIC, from = 'kg') => {
  return getDefaultUnit(seedAmounts, value, system, from);
};

export const defaultUnitMap = {
  length: getDefaultDisplayDistanceUnit,
  area: getDefaultDisplayAreaUnit,
  mass: getDefaultDisplayMassUnit,
};
