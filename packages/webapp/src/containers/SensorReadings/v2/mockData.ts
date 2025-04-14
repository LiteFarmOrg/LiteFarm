import {
  Sensor,
  SensorReadings,
  SensorReadingTypes,
  SensorReadingTypeUnits,
} from '../../../store/api/types';

const units: Record<SensorReadingTypes, SensorReadingTypeUnits> = {
  temperature: 'C',
  wind_speed: 'm/s',
  wind_direction: 'deg',
  cumulative_rainfall: 'mm',
  rainfall_rate: 'mm/h',
  relative_humidity: '%',
  barometric_pressure: 'hPa',
  solar_radiation: 'W/m2',
  current: 'hPa',
  energy: 'hPa',
  soc: 'hPa',
  soil_water_content: '%',
  soil_water_potential: 'kPa',
  solenoid_control: 'hPa',
  voltage: 'hPa',
  water_pressure: 'psi',
};

export const getDummyWeatherData = (
  sensors: Sensor[],
  startDate: Date,
  endDate: Date,
  truncPeriod: 'day' | 'minute' | 'hour',
): SensorReadings[] => {
  const result: SensorReadings[] = [];
  const span = {
    minute: 60,
    hour: 60 * 60,
    day: 60 * 60 * 24,
  }[truncPeriod];

  const today =
    truncPeriod === 'day'
      ? new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
      : new Date();
  const startDateTime = startDate.getTime() / 1000;
  const endDateTime = (endDate.getTime() > today.getTime() ? today : endDate).getTime() / 1000;

  // Comment out params you don't want to display
  const params: SensorReadingTypes[] = {
    'Weather station': [
      'temperature',
      'wind_speed',
      'wind_direction',
      'cumulative_rainfall',
      'relative_humidity',
      'barometric_pressure',
      'solar_radiation',
      'rainfall_rate',
    ] as SensorReadingTypes[],
    'Soil Water Potential Sensor': [
      'temperature',
      'soil_water_potential',
      'soil_water_content',
    ] as SensorReadingTypes[],
    'IR Temperature Sensor': ['temperature' as SensorReadingTypes],
    'Wind speed sensor': ['wind_speed' as SensorReadingTypes],
    'Drip line pressure sensor': ['water_pressure' as SensorReadingTypes],
  }[sensors[0].name];

  params.forEach((param) => {
    const readings = [];
    for (let i = startDateTime; i <= endDateTime; i += span) {
      readings.push(
        sensors.reduce((acc, { external_id }) => ({ ...acc, [external_id]: Math.random() * 361 }), {
          dateTime: i,
        }),
      );
    }
    result.push({ reading_type: param, unit: units[param], readings });
  });

  return result;
};
