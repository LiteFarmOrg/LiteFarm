export const DEFAULT_CENTER = {
  lat: 49.24966,
  lng: -123.237421,
};
export const DEFAULT_ZOOM = 15;
export const GMAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const ENVIRONMENT = import.meta.env.NODE_ENV;
export const CHART_LINE_COLORS = ['#3ea992', '#8f26f0', '#f58282', '#AA5F04', '#0669e1', '#3E2723'];

export const AMBIENT_TEMPERATURE = 'Ambient temperature';
export const CURRENT_DATE_TIME = 'current_date_time';

export const DAILY_FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast/daily';

// https://openweathermap.org/api/geocoding-api#reverse - the most relevant values (array) based on coordinates are returned
export const REVERSE_GEOCODING_API_URL = 'http://api.openweathermap.org/geo/1.0/reverse';

export const OPEN_WEATHER_API_URL_FOR_SENSORS = [
  'https://history.openweathermap.org/data/2.5/history/city',
  'https://pro.openweathermap.org/data/2.5/forecast/hourly',
  DAILY_FORECAST_API_URL,
  REVERSE_GEOCODING_API_URL,
];
export const HOUR = 'hour';
export const TEMPERATURE = 'temperature';
export const SOIL_WATER_POTENTIAL = 'soil_water_potential';
export const SOIL_WATER_CONTENT = 'soil_water_content';
export const SENSOR = 'sensor';
