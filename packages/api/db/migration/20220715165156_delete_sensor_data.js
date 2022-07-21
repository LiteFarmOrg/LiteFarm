const deleteSensorData = require('../deleteSensorData');

exports.up = async function (knex) {
  await deleteSensorData(knex);
};

exports.down = async function (knex) {
  await deleteSensorData(knex);
};
