const managementPlanModel = require('../../models/managementPlanModel');

async function activeManagementPlanCheck(req, res, next) {
  const currentDate = new Date();
  const {params} = req;
  if (params.crop_variety_id) {
    const cropVarietalManagementPlanResults = await managementPlanModel.query().where({crop_variety_id: params.crop_variety_id})// check if there is a management plan that has the crop varietal
    if (cropVarietalManagementPlanResults.length > 0) { // this crop varietal is in at least one management plan
      for (const mp of cropVarietalManagementPlanResults) {
        if ((!!mp.harvest_date && mp.harvest_date.getTime() > currentDate.getTime()) || (!!mp.termination_date && mp.termination_date.getTime() > currentDate.getTime())) {
          return res.status(400).send({message: 'Cannot delete! Active or future crop management plans exist for this varietal'});
        }
        if (mp.seed_date.getTime() > currentDate.getTime()) {
          return res.status(400).send({message: 'Cannot delete! Active or future crop management plans exist for this varietal'});
        }
      }
    }
  } else { // crop variety not received
    return res.status(400).send({message: 'Did not receive crop variety id'});
  }
  return next();
}

module.exports = activeManagementPlanCheck;
