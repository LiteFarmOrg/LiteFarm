import managementPlanModel from '../../models/managementPlanModel.js';

async function activeManagementPlanCheck(req, res, next) {
  const { params } = req;
  if (params.crop_variety_id) {
    const cropVarietalManagementPlanResults = await managementPlanModel
      .query()
      .where({ crop_variety_id: params.crop_variety_id })
      .whereNull('abandon_date')
      .whereNull('complete_date');
    if (cropVarietalManagementPlanResults.length > 0) {
      return res.status(400).send({
        message: 'Cannot delete! Active or future crop management plans exist for this varietal',
      });
    }
  } else {
    // crop variety not received
    return res.status(400).send({ message: 'Did not receive crop variety id' });
  }
  return next();
}

export default activeManagementPlanCheck;
