const managementPlanModel = require('../../models/managementPlanModel');

async function activeManagementPlanCheck(req, res, next) {
  const { params } = req;
  if (params.crop_variety_id) {
    const cropVarietalManagementPlanResults = await managementPlanModel.query().where({ crop_variety_id: params.crop_variety_id }).andWhere(function () {
      this.where('abandon_date', '>', 'now()').orWhere('complete_date', '>', 'now()');
    })
    if (cropVarietalManagementPlanResults.length > 0) {
      return res.status(400).send({ message: 'Cannot delete! Active or future crop management plans exist for this varietal' });
    }
  } else { // crop variety not received
    return res.status(400).send({ message: 'Did not receive crop variety id' });
  }
  return next();
}

module.exports = activeManagementPlanCheck;
