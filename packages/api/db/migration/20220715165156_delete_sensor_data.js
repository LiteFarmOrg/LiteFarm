import deleteSensorData from '../deleteSensorData.js';

export const up = async function (knex) {
  await deleteSensorData(knex);
};

export const down = function () {
  console.log('not implemented');
};
