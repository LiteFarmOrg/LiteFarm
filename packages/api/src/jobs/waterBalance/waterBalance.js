/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (waterBalance.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

const { from } = require('rxjs');
const { delay, concatMap } = require('rxjs/operators');
const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../../knexfile')[environment];
const knex = Knex(config);
const rp = require('request-promise');
const credentials = require('../../credentials');
const endPoints = require('../../endPoints');
const scheduler = require('node-schedule');
const waterBalanceModel = require('../../models/waterBalanceModel');
const waterBalanceScheduleModel = require('../../models/waterBalanceSchedule');
const weatherModel = require('../../models/weatherModel');
const weatherHourlyModel = require('../../models/weatherHourlyModel');
/* eslint-disable no-console */


class waterBalanceScheduler {
  static registerHourlyJob() {
    const rule = new scheduler.RecurrenceRule();
    rule.hour = [new scheduler.Range(1, 23)];
    rule.minute = 0;
    // scheduler.scheduleJob('*/20 * * * * *', () => {
    scheduler.scheduleJob(rule, () => {
      grabFarmIDsToRun()
        .then((currFarms) => {
          if (Array.isArray(currFarms) && currFarms.length > 0) {
            currFarms.forEach(async (farmID) => {
              saveWeatherData(farmID);
            })
          }
        })
        .catch((error) => {
          console.log(error)
        });
      console.log('Water Balance Hourly Calculation has Ran')
    });
  }

  static registerDailyJob() {
    const rule = new scheduler.RecurrenceRule();
    rule.hour = 0;
    rule.minute = 0;
    // scheduler.scheduleJob('*/10 * * * * *', () => {
    scheduler.scheduleJob(rule, () => {
      grabFarmIDsToRun().then((farms) => {
        if (Array.isArray(farms) && farms.length > 0) {
          farms.forEach(async (farmID) => {
            return waterBalanceDailyCalc(farmID)
              .then((dailyCalculationsCropArray) => {
                return callDB(dailyCalculationsCropArray)
              })
              .then((farmID) => {
                return removeWeather(farmID)
              })
              .then((farmID) => {
                return saveWeatherData(farmID)
              })
              .catch((error) => {
                console.log(error)
              })
          })
        }
      });
      console.log('Water Balance Daily Calculation has Ran')
    });
  }

  static async addWaterBalance(waterBalances) {
    await waterBalances.forEach(async (waterBalance) => {
      try {
        await waterBalanceModel.query().insert(waterBalance).returning('*');
      } catch (e) {
        console.log(e);
      }
    });
    console.log('Added a Water Balance')
  }


  static async registerFarmID(farmID) {
    try {
      await waterBalanceScheduleModel.query().insert({ farm_id: farmID });
      console.log('Water Balance: Registered a new FarmID')
    } catch (e) {
      console.log(e);
    }
  }

  static async checkFarmID(farmID) {
    const dataPoints = await knex.raw(`SELECT w.farm_id 
    FROM "waterBalanceSchedule" w 
    WHERE w.farm_id = '${farmID}'`);
    return (dataPoints.rows.length === 1)
  }
}

const grabFarmIDsToRun = async () => {
  const dataPoints = await knex.raw('SELECT w.farm_id FROM "waterBalanceSchedule" w');
  return dataPoints.rows
};


const saveWeatherData = async (dataPoint) => {
  const farmID = dataPoint.farm_id;
  const dataPoints = await knex.raw(
    `SELECT DISTINCT f.station_id
    FROM "field" f
    WHERE f.farm_id = '${farmID}'`
  );
  from(dataPoints.rows)
    .pipe(
      concatMap(({ station_id }) =>
        from(callOpenWeatherAPI(station_id))
          .pipe(delay(1000))
      )
    ).subscribe((weatherData) => {
      saveWeatherToDisk(weatherData);
    });
};

const saveWeatherToDisk = async (weatherData) => {
  const hourlyWeatherData = {
    created_at: new Date(),
    min_degrees: weatherData['main']['temp_min'],
    max_degrees: weatherData['main']['temp_max'],
    precipitation: calculatePrecipitation(weatherData),
    min_humidity: weatherData['main']['humidity'],
    max_humidity: weatherData['main']['humidity'],
    wind_speed: weatherData['wind']['speed'],
    station_id: weatherData.id,
    data_points: 1,
  };
  try {
    const data = await knex.raw(`
    SELECT *
    FROM "weatherHourly" w
    WHERE w.station_id = '${weatherData.id}'
    `);
    if (data.rows && data.rows.length > 0) {
      const currentWeather = compareWeatherData(data.rows[0], hourlyWeatherData);
      await knex.raw(
        `UPDATE "weatherHourly" w
        SET min_degrees = '${currentWeather.min_degrees}', max_degrees = '${currentWeather.max_degrees}', min_humidity = '${currentWeather.min_humidity}', 
        max_humidity = '${currentWeather.max_humidity}', precipitation = '${currentWeather.precipitation}', wind_speed = '${currentWeather.wind_speed}', 
        data_points = '${currentWeather.data_points}'
        WHERE station_id  = '${weatherData.id}'
        `)
    } else {
      await weatherHourlyModel.query().insert(hourlyWeatherData).returning('*');
    }
  } catch (e) {
    console.log(e);
  }
};

const compareWeatherData = (existingWeatherData, newWeatherData) => {
  const returningWeatherData = {};

  for (const key in existingWeatherData) {
    switch (key) {
      case 'min_degrees':
        returningWeatherData[key] = Math.min(existingWeatherData[key], newWeatherData[key]);
        break;
      case 'max_degrees':
        returningWeatherData[key] = Math.max(existingWeatherData[key], newWeatherData[key]);
        break;
      case 'precipitation':
        returningWeatherData[key] = existingWeatherData[key] + newWeatherData[key];
        break;
      case 'min_humidity':
        returningWeatherData[key] = Math.min(existingWeatherData[key], newWeatherData['min_humidity']);
        break;
      case 'max_humidity':
        returningWeatherData[key] = Math.max(existingWeatherData[key], newWeatherData['max_humidity']);
        break;
      case 'wind_speed':
        returningWeatherData[key] = existingWeatherData[key] + newWeatherData[key];
        break;
      case 'field_id':
        returningWeatherData[key] = existingWeatherData[key];
        break;
      case 'data_points':
        returningWeatherData[key] = existingWeatherData[key] + 1;
        break;
      default:
      // should be no default case
    }
  }
  return returningWeatherData
};

const removeWeather = async (farmID) => {
  try {
    await knex.raw(`DELETE FROM "weatherHourly"
  WHERE weather_hourly_id IN
  (SELECT w.weather_hourly_id
  FROM "field" f, "weatherHourly" w
  WHERE f.farm_id = '${farmID}' and w.station_id = f.station_id)`);
    console.log('Deleted Weather For FarmID: ', farmID);
    return { farm_id: farmID }
  } catch (e) {
    console.log(e)
  }
};

const waterBalanceDailyCalc = async (dataPoint) => {
  const previousDay = await formatDate(new Date(), true);
  const currentDay = await formatDate(new Date());
  const farmID = dataPoint.farm_id;
  const dataPoints = await knex.raw(
    `
    SELECT c.crop_common_name, c.crop_id, fc.field_crop_id, f.field_id, c.max_rooting_depth, c.mid_kc, AVG(sdl.om) as om, f.grid_points, il."flow_rate_l/min", il.hours, fc.area_used, MAX(sdl.texture) as texture
    FROM "field" f, "crop" c, "users" u,
    "activityLog" al,
    "soilDataLog" sdl, 
    "activityFields" af, 
    "fieldCrop" fc
    LEFT JOIN (
    SELECT w.field_id, w.crop_id, w.soil_water, w.created_at FROM "waterBalance" w, "field" f
    WHERE w.field_id = f.field_id and f.farm_id = '${farmID}' and to_char(date(w.created_at), 'YYYY-MM-DD') = '${previousDay}') 
    w ON w.field_id = fc.field_id and w.crop_id = fc.crop_id
    LEFT JOIN (
    SELECT SUM(il."flow_rate_l/min") as "flow_rate_l/min", SUM(il.hours) as hours,ac.field_crop_id
    FROM "irrigationLog" il, "activityCrops" ac, "activityLog" al
    WHERE il.activity_id = ac.activity_id and al.activity_id = il.activity_id
    and to_char(date(al.date), 'YYYY-MM-DD') = '${currentDay}'
    GROUP BY ac.field_crop_id
    ) il ON il.field_crop_id = fc.field_crop_id
    WHERE fc.field_id = f.field_id and f.farm_id = '${farmID}' and c.crop_id = fc.crop_id and u.farm_id = '${farmID}' and al.activity_id = sdl.activity_id and af.field_id = fc.field_id and af.activity_id = sdl.activity_id
    GROUP BY c.crop_common_name, c.crop_id, fc.field_crop_id,c.max_rooting_depth, c.mid_kc, f.grid_points, f.field_id, il."flow_rate_l/min", il.hours, fc.area_used, w.soil_water
    `
  );
  if (dataPoints.rows) {
    const weatherDataByField = await grabWeatherData(farmID);
    postWeatherToDB(weatherDataByField);
    const returnValue = await doWaterBalanceCalculations(dataPoints.rows, weatherDataByField, farmID)
    returnValue['farm_id'] = farmID;
    return returnValue;
  } else {
    // eslint-disable-next-line no-console
    console.log('No Data found for Water Balance Calculation');
  }
};


const doWaterBalanceCalculations = async (data, weatherDataByField) => {
  const promises = [];
  const textures = {
    'sand': { sand: 0.88, clay: 0.05 },
    'loamySand': { sand: 0.80, clay: 0.05 },
    'sandyLoam': { sand: 0.65, clay: 0.10 },
    'loam': { sand: 0.40, clay: 0.20 },
    'siltyLoam': { sand: 0.20, clay: 0.15 },
    'silt': { sand: 0.10, clay: 0.05 },
    'sandyClayLoam': { sand: 0.60, clay: 0.25 },
    'clayLoam': { sand: 0.30, clay: 0.35 },
    'siltyClayLoam': { sand: 0.10, clay: 0.35 },
    'siltyClay': { sand: 0.10, clay: 0.45 },
    'sandyClay': { sand: 0.50, clay: 0.40 },
    'clay': { sand: 0.25, clay: 0.50 },
  };
  data.forEach(async (crop) => {
    promises.push(new Promise((resolve, reject) => {
      const texture = crop.texture;
      calculateSoilWaterContent(crop, weatherDataByField[crop.field_id], textures)
        .then((soilWaterContent) => {
          return {
            soilWaterContent,
            plantAvailableWater: soilWaterContent - calculateWiltingPoint(textures[texture], crop.om, crop.max_rooting_depth),
          }
        })
        .then((calculations) => {
          resolve({
            field_id: crop.field_id,
            crop_id: crop.crop_id,
            soil_water: calculations.soilWaterContent,
            plant_available_water: calculations.plantAvailableWater,
          })
        })
        .catch((error) => {
          reject(error);
        });
    }));
  });

  return await Promise.all(promises).then((cropArray) => {
    return cropArray
  })
};

const calculateSoilWaterContent = async (data, weatherData, textures) => {
  // reference: https://ora.ox.ac.uk/objects/uuid:a6603a69-dd8d-478b-8756-b06163677cf1/download_file?file_format=pdf&safe_filename=Mehrabi_PhDThesis.pdf&type_of_work=Thesis
  const texture = data.texture;
  const averageWeatherData = weatherData;
  const fieldCapacity = calculateFieldCapacity(textures[texture], data.om, data.max_rooting_depth);
  const oldSoilWaterContent = data.soil_water;
  let precipitation = calculatePrecipitation(weatherData);
  const irrigation = calculateIrrigation(data['flow_rate_l/min'], data['hours'], data['area_used']);
  precipitation += irrigation;
  const ET = await calculateEvapotranspiration(data, averageWeatherData);
  if (oldSoilWaterContent + precipitation > fieldCapacity) {
    return fieldCapacity - ET;
  } else {
    return (oldSoilWaterContent + precipitation) - ET;
  }
};

const calculateIrrigation = (flow_rate_l, hours, area_used) => {
  if (flow_rate_l !== null && hours !== null) {
    const minutes = hours * 60;
    const volume = flow_rate_l * minutes;
    return volume / area_used
  } else return 0
};

const postWeatherToDB = async (weatherDataMap) => {
  for (const key in weatherDataMap) {
    try {
      await weatherModel.query().insert(weatherDataMap[key]).returning('*');
      console.log('Posted Weather Data')
    } catch (e) {
      console.log(e);
    }
  }
};

const grabWeatherData = async (farmID) => {
  const weatherData = {};
  const dataPoints = await knex.raw(`
  SELECT f.field_id, w.min_degrees as min_degrees, w.max_degrees as max_degrees, w.min_humidity as min_humidity, 
  w.max_humidity as max_humidity, w.precipitation as precipitation, w.wind_speed as wind_speed, w.data_points as data_points
  FROM "weatherHourly" w, "field" f
  WHERE w.station_id = f.station_id and f.farm_id = '${farmID}'
  `);
  if (dataPoints.rows) {
    dataPoints.rows.forEach((field) => {
      field.wind_speed = field.wind_speed / field.data_points;
      weatherData[field.field_id] = field
    });
    return weatherData;
  } else {
    console.log('No Weather Data for Farm: ', farmID)
  }
};
const calculatePrecipitation = (weatherData) => {
  if (weatherData) {
    if (weatherData['rain'] != null) {
      return weatherData['rain']['1h'] || weatherData['rain']['3h']
    } else if (weatherData['snow'] != null) {
      return weatherData['snow']['1h'] || weatherData['snow']['3h']
    } else {
      return 0
    }
  } else {
    return 0
  }
};

const calculateWiltingPoint = (textureObject, organicMatter, rootingDepth) => {
  // reference: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.452.9733&rep=rep1&type=pdf
  const wiltingPoint_1 = (-0.024 * textureObject.sand) + (0.487 * textureObject.clay) + 0.006 * organicMatter
    + 0.005 * (textureObject.sand * textureObject.clay) - 0.013 * (textureObject.clay * organicMatter)
    + 0.068 * (textureObject.sand * textureObject.clay) + 0.031;

  const wiltingPoint_2 = wiltingPoint_1 + (0.14 * wiltingPoint_1 - 0.02);
  return wiltingPoint_2 * rootingDepth
};

const calculateFieldCapacity = (textureObject, organicMatter, rootingDepth) => {
  // reference: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.452.9733&rep=rep1&type=pdf
  const fieldCapacity_1 = (-0.251 * textureObject.sand) + (0.195 * textureObject.clay) + (0.011 * organicMatter)
    + 0.006 * (textureObject.sand * organicMatter) - 0.027 * (textureObject.clay * organicMatter)
    + 0.452 * (textureObject.sand * textureObject.clay) + 0.299
  const fieldCapacity_2 = fieldCapacity_1 + (1.283 * Math.pow(fieldCapacity_1, 2)
    - 0.374 * fieldCapacity_1 - 0.015);
  return fieldCapacity_2 * rootingDepth
};

const calculateEvapotranspiration = async (data, weatherData) => {
  // reference: http://www.fao.org/3/X0490E/x0490e08.htm#eto%20calculated%20with%20different%20time%20steps
  if (weatherData) {
    const tal = 1; //clear sky transmissivity
    const albedo = 0.23;
    const grid_point = data.grid_points[0];
    const averageTemperature = (weatherData['min_degrees'] + weatherData['max_degrees']) / 2;
    const elevationData = await callGoogleMapsAPI(grid_point);
    const windSpeed = calculateWindSpeed(weatherData['wind_speed']);
    const extraTSolarRadiation = calculateExtraTSolarRadiation(grid_point, elevationData);
    // solar radiation calculation reference: https://agriculture.alberta.ca/acis/docs/Estimating-solar-radiation-using-daily-max-and-min-temperatures-data-y2014_m06_d13.pdf
    const solarRadiation = calculateSolarRadiation(weatherData, extraTSolarRadiation);
    const slope = calculateSlope(averageTemperature);
    const psychometricConstant = calculatePsychometricConstant(elevationData, averageTemperature);
    const saturatedVP = (calculateSaturatedVapourPressure(weatherData['min_degrees']) + calculateSaturatedVapourPressure(weatherData['max_degrees'])) / 2;
    const actualVP = (calculateActualVapourPressure(weatherData['min_degrees'], weatherData['max_humidity'])
      + calculateActualVapourPressure(weatherData['max_degrees'], weatherData['min_humidity'])) / 2;
    const rnl = calculateRNL(weatherData['min_degrees'], weatherData['max_degrees'], solarRadiation, actualVP, extraTSolarRadiation, tal);
    const rns = calculateRNS(solarRadiation, albedo);

    return (0.408 * slope * (rns - rnl) + psychometricConstant * (900 / (averageTemperature + 273)) * windSpeed * (saturatedVP - actualVP)) / (slope + psychometricConstant * (1 + 0.34 * windSpeed))
  } else {
    return 0;
  }
};

const calculateWindSpeed = (windSpeed) => {
  const calculatedWindSpeed = windSpeed * 4.87 / Math.log(67.8 * 10 - 5.42);
  return Math.round(calculatedWindSpeed * 1000) / 1000
};

const calculateRNL = (minTemp, maxTemp, solarRadiation, actualVapourPressure, extraT, tal) => {
  return 4.903e-09 * ((Math.pow(maxTemp + 273.16, 4) + Math.pow(minTemp + 273.16, 4)) / 2) * (0.34 - 0.14 * Math.sqrt(actualVapourPressure)) * (1.35 * solarRadiation / (extraT * tal) - 0.35)
};

const calculateRNS = (solarRadiation, albedo) => {
  return (1 - albedo) * solarRadiation
};

const calculatePsychometricConstant = (elevation, averageTemperature) => {
  // reference: http://www.fao.org/3/X0490E/x0490e0j.htm#annex%202.%20meteorological%20tables
  const p = 101.3 * (Math.pow((293 - 0.0065 * elevation) / 293, 5.26));
  return (1.013e-03 * p) / (0.622 * (2.501 - 0.002361 * averageTemperature));
};

const calculateSlope = (temperature) => {
  // reference: http://www.fao.org/3/X0490E/x0490e0j.htm#annex%202.%20meteorological%20tables
  return (4098 * (0.6108 * Math.exp(17.27 * temperature / (temperature + 237.3)))) / Math.pow(temperature + 237.3, 2)
};

const calculateExtraTSolarRadiation = (data) => {
  // data is an array of gridpoints from a field

  const latitude = data.lat;
  const dayOfYear = grabDayOfYear();
  const latitudeInRadian = latitude * Math.PI / 180;
  const corrEarthSunDist = 1 + 0.0334 * Math.cos(0.01721 * dayOfYear - 0.0552);
  const solarDecl = 0.4093 * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365);
  const daylightTimeFactor = Math.acos(-Math.tan(latitudeInRadian) * Math.tan(solarDecl));

  return 4.921 * 24 / Math.PI * corrEarthSunDist *
    (Math.sin(latitudeInRadian) * Math.sin(solarDecl) * daylightTimeFactor + Math.cos(latitudeInRadian) * Math.cos(solarDecl)) *
    Math.sin(daylightTimeFactor)
};

const calculateSolarRadiation = (weatherData, extraTSolar) => {
  if (weatherData) {
    return 0.16 * extraTSolar * (weatherData['max_degrees'] - weatherData['min_degrees'])
  } else {
    return 1
  }
};
const calculateSaturatedVapourPressure = (temperature) => {
  return 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3))
};

const calculateActualVapourPressure = (temperature, humidity) => {
  const saturatedVP = calculateSaturatedVapourPressure(temperature);
  return saturatedVP * humidity / 100
};

const grabDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const callOpenWeatherAPI = async (cityId) => {
  const options = {
    uri: endPoints.openWeatherAPI,
    qs: {
      // Replacing Lat Long Query for city Id query
      // lon: gridPoint['lng'],
      // lat: gridPoint['lat'],
      id: cityId,
      units: 'metric',
      APPID: credentials.OPEN_WEATHER_APP_ID,
    },
  };
  return await rp(options)
    .then((data) => {
      return JSON.parse(data);
    })
    .catch((err) => {
      return err
    })
};

const callGoogleMapsAPI = async (gridPoint) => {
  const options = {
    uri: endPoints.googleMapsAPI,
    qs: {
      locations: gridPoint.lat + ',' + gridPoint.lng,
      key: credentials.GOOGLE_API_KEY,
    },
  };
  return await rp(options)
    .then((data) => {
      const googleMapsInfo = JSON.parse(data);
      return googleMapsInfo['results'][0]['elevation'];
    })
};

const callDB = (contentFile) => {
  contentFile.forEach((calculation) => {
    calculation['soil_water'] = Math.round(calculation['soil_water'] * 100) / 100;
    calculation['plant_available_water'] = Math.round(calculation['plant_available_water'] * 100) / 100;
  });
  waterBalanceScheduler.addWaterBalance(contentFile);
  return contentFile.farm_id;
};

const formatDate = (date, prevDay) => {
  const d = new Date(date), year = d.getFullYear();
  let month = '' + (d.getMonth() + 1);
  let day = prevDay ? '' + d.getDate() - 1 : '' + d.getDate(); // I want to grab the previous dates soilWater so I subtract one

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

module.exports = waterBalanceScheduler;

