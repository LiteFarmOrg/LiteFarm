const metric = ['metric', 'celsius'];
const imperial = ['imperial', 'fahrenheit'];

export const getTemperatureValue = (value, unit) => {
  if (imperial.includes(unit.toLowerCase())) return convertCelsiusToFahrenheit(value);
  return value;
};

export const getTemperatureUnit = (unit) => {
  if (imperial.includes(unit.toLowerCase())) return 'ºF';
  return 'ºC';
};

const convertCelsiusToFahrenheit = (temperature) => {
  return temperature * 1.8 + 32;
};
