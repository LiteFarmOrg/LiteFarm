const SOIL_MOISTURE_CONTENT = 'soil_water_content';
const WATER_POTENTIAL = 'soil_water_potential';
const TEMPERATURE = 'temperature';

export const requiredReadingTypes = [SOIL_MOISTURE_CONTENT, WATER_POTENTIAL, TEMPERATURE];

export const ErrorTypes = {
  DEFAULT: -1,
  EMPTY_FILE: 1,
  INVALID_CSV: 0,
};
