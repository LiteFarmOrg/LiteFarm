const express = require('express');
const router = express.Router();
const { tableCleanup } = require('../../tests/testEnvironment');
const knex = require('../util/knex');

//POST /testData/tableCleanup
router.post('/tableCleanup', async (req, res) => {
    try {
        await tableCleanup(knex);
        res.status(200).send('database tables cleared successfully');
    } catch (error) {
        res.status(400).send(error);
    }
  });

  module.exports = router;