/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (insightHelpers.js) is part of LiteFarm.
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

import rp from 'request-promise';

import endPoints from '../endPoints.js';

// helper functions

// helpers for Soil OM

export const getSoilOM = async (data) => {
  const returnValue = {
    preview: 0,
    data: [],
  };

  if (data.length === 0) return returnValue;

  const returnData = {};
  data.map((element) => {
    if (!(element.location_id in returnData)) {
      // The current field is not added to the returnData yet
      returnData[element.location_id] = initOMData(element);
    } else {
      // If the current field has multiple soil data logs, put them
      // into a list for calculating the average
      returnData[element.location_id]['activity_oms'].push(grabOM(element));
    }
  });

  // assigning 'soil_om' to be the average of 'activity_oms'
  // if there is no data, call the soilgrids api based on the first gridpoint

  const soilGridPromises = Object.keys(returnData).map(async (key) => {
    const summed = returnData[key]['activity_oms'].reduce((a, b) => a + b, 0);
    if (summed === 0) {
      if (returnData[key]['grid_points'].length === 0) {
        // not possible to retrieve data as we have no data for this soil data log
        returnData[key]['soil_om'] = 0;
      } else {
        returnData[key]['soil_om'] = await callSoilGridAPI(returnData[key]); // saving async stuff in a queue
      }
    } else {
      returnData[key]['soil_om'] = summed / returnData[key]['activity_oms'].length;
    }
  });
  await Promise.all(soilGridPromises);

  let runningAverage = 0;
  for (const key in returnData) {
    runningAverage += returnData[key]['soil_om'];
  }
  returnValue['preview'] =
    Math.round((runningAverage / Object.keys(returnData).length) * 100) / 100;

  // max OM becomes 100% while everything else is based on it
  let maxSoilOM = 0;
  for (const key in returnData) {
    maxSoilOM = Math.max(returnData[key]['soil_om'], maxSoilOM);
  }
  for (const key in returnData) {
    returnData[key]['percentage'] = (returnData[key]['soil_om'] / maxSoilOM) * 100;
  }
  // normalize to put in 'data' field of returnValue

  for (const key in returnData) {
    returnValue.data.push(returnData[key]);
  }
  return returnValue;
};

const initOMData = (element) => {
  const OMData = {};
  // set the field name
  OMData['field_name'] = element.name;
  OMData['soil_om'] = 0;
  OMData['grid_points'] = element.grid_points;
  OMData['percentage'] = 0;
  OMData['activity_oms'] = [grabOM(element)];

  return OMData;
};

// if om does not exist, grab organic_carbon, if organic_carbon does not exist, grab total_carbon
const grabOM = (element) => {
  // parse the OM %
  if (element.om !== 0) {
    return element.om;
  } else if (element.organic_carbon !== 0) {
    return element.organic_carbon;
  } else {
    return element.total_carbon;
  }
};

const callSoilGridAPI = async (data) => {
  const options = {
    uri: endPoints.soilGridsAPI,
    qs: {
      lon: data['grid_points'][0]['lng'],
      lat: data['grid_points'][0]['lat'],
      property: 'soc',
      depth: '5-15cm',
      value: 'mean',
    },
  };
  return await rp(options)
    .then((data) => {
      const parsedObject = JSON.parse(data);
      let soil_om = parsedObject['properties']['layers'][0]['depths'][0]['values']['mean'];
      soil_om *= 2 * 0.01;
      return Math.floor(soil_om);
    })
    .catch((err) => {
      return err;
    });
};

/* Helpers for Labour Happiness */

export const getLabourHappiness = (data) => {
  const returnValue = {
    preview: 0,
    data: [],
  };

  const tasks = {};
  // parse by shift_id first in order to do the algorithm discussed with Zia on the whiteboard
  // TODO: during october release, this has been refactored.
  //       need to check if we should account for any task with happiness set, or any with duration set
  data.map((element) => {
    const currentValueMood = element['happiness'];
    const taskObject = {
      taskName: element['task_translation_key'],
      duration: element['duration'] ?? 0,
    };
    if (!(element['task_id'] in tasks)) {
      tasks[element['task_id']] = { mood: currentValueMood, tasks: [taskObject] };
    } else {
      tasks[element['task_id']]['tasks'].push(taskObject);
    }
  });

  const weightedTasks = {};
  // now parse each task that was assigned to the shift_id individually
  for (const key in tasks) {
    const currentMood = tasks[key]['mood'];
    const currentTasks = tasks[key]['tasks']; // an array
    let currentDurationAverage = 0;
    currentTasks.map((element) => (currentDurationAverage += element['duration']));
    currentTasks.map((element) => {
      const weighted = currentDurationAverage ? element['duration'] / currentDurationAverage : 1;
      if (!(element['taskName'] in weightedTasks)) {
        weightedTasks[element['taskName']] = [{ mood: currentMood, weight: weighted }];
      } else {
        weightedTasks[element['taskName']].push({ mood: currentMood, weight: weighted });
      }
    });
  }

  // perform a "weighted mean" to get accurate data on ratings of tasks
  for (const key in weightedTasks) {
    const currentTask = key;
    const moodsWithWeights = weightedTasks[key];
    let currentNumerator = 0;
    let currentDenominator = 0;
    moodsWithWeights.map((element) => {
      currentNumerator += element['mood'] * element['weight'];
      currentDenominator += element['weight'];
    });
    returnValue['data'].push({
      task: currentTask,
      mood: Math.round((currentNumerator / currentDenominator) * 100) / 100,
    });
  }

  // finally, calculate the running average to display for the preview
  let average = 0;
  returnValue['data'].map((element) => {
    average += element['mood'];
  });
  returnValue['preview'] = Math.round((average / returnValue['data'].length) * 100) / 100;
  return returnValue;
};

const findCentroid = (points) => {
  let x = 0;
  let y = 0;
  points.forEach((p) => {
    x += p.lng;
    y += p.lat;
  });
  return { lng: x / points.length, lat: y / points.length };
};

const latlngCounterClockwiseLessThan = (a, b, center) => {
  // compute the cross product of vectors (center -> a) x (center -> b)
  // From right-hand rule this is +ve if a comes before b in ccw direction, -ve is a comes after b in ccw direction
  const det =
    (a.lng - center.lng) * (b.lat - center.lat) - (b.lng - center.lng) * (a.lat - center.lat);
  if (det < 0) {
    return 1;
  } else if (det > 0) {
    return -1;
  }
  // if we get here points are on the same line from the centre, so we want to return the point which is closest to the centre
  const distanceA = Math.pow(a.lng - center.lng, 2) + Math.pow(a.lat - center.lat, 2);
  const distanceB = Math.pow(b.lng - center.lng, 2) + Math.pow(b.lat - center.lat, 2);
  return distanceA < distanceB ? 1 : -1;
};

const makePolygon = (points) => {
  let polygonString = 'POLYGON((';
  points.forEach((p) => {
    polygonString = polygonString.concat(`${p.lng} ${p.lat},`);
  });
  return polygonString.concat(`${points[0].lng} ${points[0].lat}))`);
};

export const getBiodiversityAPI = async (pointData, countData) => {
  const resultData = {
    preview: 0,
    data: [],
  };

  const filterDictionary = {
    Birds: { classKey: 212 },
    Insects: { classKey: 216 },
    Plants: { kingdomKey: 6 },
    Amphibians: { classKey: 131 },
    Mammals: { classKey: 359 },
  };

  const speciesCount = {
    Birds: 0,
    Insects: 0,
    Plants: 0,
    Amphibians: 0,
    CropVarieties: parseInt(countData),
    Mammals: 0,
  };

  const parsedSpecies = [];

  const processBiodiversityResults = (results, label) => {
    results.map((result) => {
      if (!parsedSpecies.includes(result.speciesKey)) {
        parsedSpecies.push(result.speciesKey);
        speciesCount[label]++;
      }
    });
  };

  const polygons = pointData.map((points) => {
    const centroid = findCentroid(points.grid_points);
    const compareLatLong = (a, b) => latlngCounterClockwiseLessThan(a, b, centroid);
    return makePolygon(points.grid_points.sort(compareLatLong));
  });

  for (const polygon of polygons) {
    for (const label in filterDictionary) {
      const qs = {
        geometry: polygon,
        limit: 300,
        ...filterDictionary[label],
      };
      const data = await rp({
        uri: endPoints.gbifAPI,
        qs: {
          ...qs,
          offset: 0,
        },
      });
      const { count, results } = JSON.parse(data);
      processBiodiversityResults(results, label);
      const apiCalls = [];
      for (let i = 300; i < count; i += 300) {
        apiCalls.push(
          new Promise((resolve, reject) => {
            rp({
              uri: endPoints.gbifAPI,
              qs: {
                ...qs,
                offset: i,
              },
            })
              .then((data) => {
                const { results } = JSON.parse(data);
                processBiodiversityResults(results, label);
                resolve();
              })
              .catch((error) => {
                reject(error);
              });
          }),
        );
      }
      await Promise.allSettled(apiCalls);
    }

    for (const label in speciesCount) {
      resultData.data.push({
        name: label,
        count: speciesCount[label],
        percent: (speciesCount[label] / parsedSpecies.length) * 100,
      });
    }
    resultData.preview = parsedSpecies.length;
    return resultData;
  }
};

export const formatPricesData = (data) => {
  const returnData = {
    preview: 0,
    data: [], // data will be generated as json files with month and value
  };

  const organizeByMonthAndYear = {}; // key: "YYYY-MM" value: array of json objects for crop_common_name
  let runningTotal = 0;
  let runningLength = 0;
  // tally the running total as well as separate the data into different months
  data.map((element) => {
    let myPriceForCrop = 0;
    let networkPriceForCrop = 0;
    if (element['sale_quant'] != null && element['sale_val'] != null) {
      myPriceForCrop = element['sale_val'] / element['sale_quant'];
    }
    if (element['network_quant'] != null && element['network_value'] != null) {
      networkPriceForCrop = element['network_value'] / element['network_quant'];
    }
    if (myPriceForCrop !== 0 && networkPriceForCrop !== 0) {
      runningTotal += myPriceForCrop / networkPriceForCrop;
    }
    runningLength += 1;
    const crop_name = element['crop_common_name'];
    const cropData = {
      crop_date: element['year_month'],
      crop_price: myPriceForCrop.toFixed(2),
      network_price: networkPriceForCrop.toFixed(2),
    };
    if (crop_name in organizeByMonthAndYear) {
      organizeByMonthAndYear[crop_name].push(cropData);
    } else {
      organizeByMonthAndYear[crop_name] = [cropData];
    }
  });
  runningTotal = (runningTotal * 100) / 100;
  returnData['preview'] = Math.ceil((runningTotal / runningLength) * 100);
  for (const key in organizeByMonthAndYear) {
    returnData['data'].push({ [key]: organizeByMonthAndYear[key] });
  }
  return returnData;
};

export const formatPricesNearbyData = (myFarmID, data) => {
  const returnData = {
    preview: 0,
    data: [], // data will be generated as json files with month and value
  };
  // {'Alfalfa for Fodder': [{crop_date: '2019-11', crop_price: 1, network_price: 1}, .., ..]}
  const organizeByMonthAndYear = {};
  const organizeByNameThenByDate = {}; // key: "YYYY-MM" value: array of json objects for crop_common_name
  const farmIDs = new Set();
  // tally the running total as well as separate the data into different months
  data.map((element) => {
    if (!(element['crop_translation_key'] in organizeByNameThenByDate)) {
      organizeByNameThenByDate[element['crop_translation_key']] = {};
    }
    if (!(element['year_month'] in organizeByNameThenByDate[element['crop_translation_key']])) {
      organizeByNameThenByDate[element['crop_translation_key']][element['year_month']] = {
        crop_price_total: 0,
        sale_quant_total: 0,
        network_price: 0,
      };
    }
    if (element['farm_id'] === myFarmID) {
      organizeByNameThenByDate[element['crop_translation_key']][element['year_month']][
        'crop_price_total'
      ] += element['sale_value'];
      organizeByNameThenByDate[element['crop_translation_key']][element['year_month']][
        'sale_quant_total'
      ] += element['sale_quant'];

      if (
        Array.isArray(
          organizeByNameThenByDate[element['crop_translation_key']][element['year_month']][
            'network_price'
          ],
        )
      ) {
        organizeByNameThenByDate[element['crop_translation_key']][element['year_month']][
          'network_price'
        ].push(element);
      } else {
        organizeByNameThenByDate[element['crop_translation_key']][element['year_month']][
          'network_price'
        ] = [element];
      }
    } else {
      // first total up all network prices in an array and then grab the mean after
      farmIDs.add(element['farm_id']);
      if (
        Array.isArray(
          organizeByNameThenByDate[element['crop_translation_key']][element['year_month']][
            'network_price'
          ],
        )
      ) {
        organizeByNameThenByDate[element['crop_translation_key']][element['year_month']][
          'network_price'
        ].push(element);
      } else {
        organizeByNameThenByDate[element['crop_translation_key']][element['year_month']][
          'network_price'
        ] = [element];
      }
    }
  });
  for (const crop_name in organizeByNameThenByDate) {
    for (const date in organizeByNameThenByDate[crop_name]) {
      // get network price by adding all quants and value and then divide for mean
      let runningNetworkQuantity = 0;
      let runningNetworkValue = 0;
      organizeByNameThenByDate[crop_name][date]['network_price'].forEach((sale) => {
        runningNetworkQuantity += sale['sale_quant'];
        runningNetworkValue += sale['sale_value'];
      });
      const networkPrice = runningNetworkValue / runningNetworkQuantity;
      const cropData = {
        crop_date: date,
        crop_price: roundToTwoDecimal(
          organizeByNameThenByDate[crop_name][date]['crop_price_total'] /
            (organizeByNameThenByDate[crop_name][date]['sale_quant_total'] || 1),
        ),
        network_price: roundToTwoDecimal(networkPrice),
      };
      if (crop_name in organizeByMonthAndYear) {
        organizeByMonthAndYear[crop_name].push(cropData);
      } else {
        organizeByMonthAndYear[crop_name] = [cropData];
      }
    }
  }
  // calculate the average price for main insight page
  let runningSum = 0;
  let runningLength = 0;
  for (const crop in organizeByMonthAndYear) {
    organizeByMonthAndYear[crop].forEach((crop) => {
      if (crop['crop_price'] !== 0) {
        runningSum += crop['crop_price'] / crop['network_price'];
        runningLength += 1;
      }
    });
  }
  returnData['preview'] = Math.ceil((runningSum / runningLength) * 100);
  returnData['amountOfFarms'] = farmIDs.size || 0;
  for (const key in organizeByMonthAndYear) {
    returnData['data'].push({ [key]: organizeByMonthAndYear[key] });
  }
  return returnData;
};

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export const distance = (lat1, lon1, lat2, lon2, unit = 'KM') => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit === 'KM') {
      dist = dist * 1.609344;
    }
    if (unit === 'MILE') {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

const roundToTwoDecimal = (number) => {
  return (number * 100) / 100;
};
