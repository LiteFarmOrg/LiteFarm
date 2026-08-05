import certificationModel from '../../models/certificationModel.js';

async function cropVarietyComplianceCheck(req, res, next) {
  const { body } = req;
  if (body.farm_id) {
    const certification = await certificationModel
      .query()
      .whereNotDeleted()
      .where({ farm_id: body.farm_id })
      .first();
    // A farm must provide the crop-variety compliance fields once it holds any certification record.
    const hasCertifications = !!certification;
    if (hasCertifications) {
      if (body.organic === null) {
        return res.status(400).send({ message: "Organic can't be null" });
      }
      if (!body.organic && (body.searched === null || body.genetically_engineered === null)) {
        return res.status(400).send({ message: "Organic can't be null" });
      }
      if (body.organic && (body.searched !== null || body.genetically_engineered !== null)) {
        return res.status(400).send({ message: 'Organic should be null' });
      }
    }
    if (!hasCertifications) {
      if (body.organic !== null || body.searched !== null || body.genetically_engineered !== null) {
        return res.status(400).send({
          message: 'This farm does not hold a certification, data should be null',
        });
      }
    }
  } else {
    return res.status(400).send({ message: 'Did not receive farm_id' });
  }
  return next();
}

export default cropVarietyComplianceCheck;
