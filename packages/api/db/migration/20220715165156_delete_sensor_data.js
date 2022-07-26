const deleteSensorData = require('../deleteSensorData');

exports.up = async function (knex) {
  await deleteSensorData(knex);
};

exports.down = function () {
  console.log('not implemented');
};
