import { convert } from '../../../util/convert-units/convert';

const metric = ['metric', 'celsius', 'kpa'];
const imperial = ['imperial', 'fahrenheit', 'psi'];

export const getTemperatureValue = (value, unit) => {
  if (typeof value !== 'number') {
    return NaN;
  }
  const to = imperial.includes(unit.toLowerCase()) ? 'F' : 'C';
  return roundToTwo(convert(value).from('C').to(to));
};

export const getTemperatureUnit = (unit) => {
  if (imperial.includes(unit.toLowerCase())) return 'º F';
  return 'º C';
};

const roundToTwo = (num) => {
  return +(Math.round(num + 'e+2') + 'e-2');
};

export const getSoilWaterPotentialValue = (value, unit) => {
  if (imperial.includes(unit.toLowerCase())) return convertKPaToPsi(value);
  return roundToTwo(value);
};

export const getSoilWaterPotentialUnit = (unit) => {
  if (imperial.includes(unit.toLowerCase())) return ' psi';
  return ' kPa';
};

const convertKPaToPsi = (soilWaterPotentialInKPa) => {
  const soilWaterPotentialInPSI = soilWaterPotentialInKPa * 0.1450377377;
  return roundToTwo(soilWaterPotentialInPSI);
};
