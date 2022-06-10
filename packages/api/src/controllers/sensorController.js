const SensorController = {
  async bulkUploadSensors(req, res) {
    console.log(req.file.buffer.toString());
    res.status(200).send('Successfully uploaded!');
  },
};

module.exports = SensorController;
