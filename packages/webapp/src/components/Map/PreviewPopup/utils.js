const metric = ['metric', 'celsius'];
const imperial = ['imperial', 'fahrenheit'];

export const getTemperatureUnit = (unit) => {
  if (metric.includes(unit.toLowerCase())) return 'ºC';
  if (imperial.includes(unit.toLowerCase())) return 'ºF';
  return '';
};
