require('dotenv').config();

export const DEFAULT_CENTER = {
  lat: 49.24966,
  lng: -123.237421,
};
export const DEFAULT_ZOOM = 15;
export const GMAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
export const ENVIRONMENT = process.env.NODE_ENV;

export const isArea = (type) => {
  return [
    locationEnum.barn,
    locationEnum.ceremonial_area,
    locationEnum.farm_site_boundary,
    locationEnum.field,
    locationEnum.garden,
    locationEnum.greenhouse,
    locationEnum.surface_water,
    locationEnum.natural_area,
    locationEnum.residence,
  ].includes(type);
};

export const isLine = (type) => {
  return [locationEnum.watercourse, locationEnum.fence, locationEnum.buffer_zone].includes(type);
};

export const isPoint = (type) => {
  return [locationEnum.gate, locationEnum.water_valve].includes(type);
};

export const locationEnum = {
  field: 'field',
  garden: 'garden',
  barn: 'barn',
  ceremonial_area: 'ceremonial_area',
  greenhouse: 'greenhouse',
  surface_water: 'surface_water',
  natural_area: 'natural_area',
  buffer_zone: 'buffer_zone',
  watercourse: 'watercourse',
  fence: 'fence',
  gate: 'gate',
  water_valve: 'water_valve',
  farm_site_boundary: 'farm_site_boundary',
  residence: 'residence',
};
