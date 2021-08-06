const typesOfTask = [
  'soil_amendment_task',
  'pest_control_task',
  'irrigation_task',
  'scouting_task',
  'soil_task',
  'field_work_task',
  'harvest_task',
  'plant_task',
];


const modelMapping = {
  soil_amendment_task: modelValidation('soil_amendment_task'),
  pest_control_task: modelValidation('pest_control_task'),
  irrigation_task: modelValidation('irrigation_task'),
  scouting_task: modelValidation('scouting_task'),
  soil_task: modelValidation('soil_task'),
  field_work_task: modelValidation('field_work_task'),
  harvest_task: modelValidation('harvest_task'),
  plant_task: modelValidation('plant_task'),
};

function modelValidation(asset) {
  return (req, res, next) => {
    const data = req.body;
    if(!data) {
      return res.status(400).send({
        message: 'Task is a required property',
      });
    }
    const nonModifiable = typesOfTask.filter(p => p !== asset);
    const isTryingToModifyOtherAssets = Object.keys(data).some(k => nonModifiable.includes(k));
    !isTryingToModifyOtherAssets ? next() : res.status(400).send({
      message: 'You are trying to modify an unallowed object',
    });
  };
}


module.exports = {
  modelMapping,
  typesOfTask
};
