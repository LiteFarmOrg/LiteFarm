const express = require('express');
const multer = require('multer');

const SensorController = require('../controllers/sensorController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post('/bulk_upload', upload.single('sensors'), SensorController.bulkUploadSensors);

module.exports = router;
