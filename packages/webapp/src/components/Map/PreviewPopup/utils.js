const metric = ['metric', 'celsius'];
const imperial = ['imperial', 'fahrenheit'];

export const getTemperatureValue = (value, unit) => {
  if (imperial.includes(unit.toLowerCase())) return convertCelsiusToFahrenheit(value);
  return roundToTwo(value);
};

export const getTemperatureUnit = (unit) => {
  if (imperial.includes(unit.toLowerCase())) return 'ºF';
  return 'ºC';
};

const convertCelsiusToFahrenheit = (temperature) => {
  const fahrenheit = temperature * 1.8 + 32;
  return roundToTwo(fahrenheit);
};

const roundToTwo = (num) => {
  return +(Math.round(num + 'e+2') + 'e-2');
};
