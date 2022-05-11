const express = require('express');
const router = express.Router();
//const { tableCleanup } = require('../../tests/testEnvironment');
//const knex = require('../util/knex');
const execSync = require('child_process').execSync;


//POST /testData/tableCleanup
router.post('/tableCleanup', async (req, res) => {
    try {
        const output = execSync('nuke_db "pg-litefarm"', { encoding: 'utf-8' });
        console.log('The output is:');
        console.log(output);
        res.status(200).send('database tables cleared successfully');
    } catch (error) {
        res.status(400).send(error);
    }
  });

  //POST /testData/runMigrations
router.post('/runMigrations', async (req, res) => {
    try {
        const output = execSync('npx knex migrate:latest', { encoding: 'utf-8' });
        console.log('The output is:');
        console.log(output);
        res.status(200).send('database seeded successfully');
    } catch (error) {
        res.status(400).send(error);
    }
  });

  module.exports = router;