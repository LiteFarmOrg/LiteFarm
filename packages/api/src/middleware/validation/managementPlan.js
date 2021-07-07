const typesOfPlantations = ['broadcast', 'container', 'beds', 'rows'];


const modelMapping = {
  broadcast: modelValidation('broadcast'),
  container: modelValidation('container'),
  beds: modelValidation('beds'),
  rows: modelValidation('rows'),
};

function modelValidation(asset) {
  return (req, res, next) => {
    const data = req.body.crop_management_plan;
    if(!data) {
      return res.status(400).send({
        message: 'crop management plan is a required property',
      });
    }
    const nonModifiable = typesOfPlantations.filter(p => p !== asset);
    const isTryingToModifyOtherAssets = Object.keys(data).some(k => nonModifiable.includes(k));
    !isTryingToModifyOtherAssets ? next() : res.status(400).send({
      message: 'You are trying to modify an unallowed object',
    });
  };
}


module.exports = {
  modelMapping,
};
