import organicCertifierModel from '../../models/organicCertifierSurveyModel';

async function organicCertifierCheck(req, res, next) {
  const { body } = req;
  if (body.farm_id) {
    const isFarmInterestedInOrganic = await organicCertifierModel
      .query()
      .where({ farm_id: body.farm_id })
      .first();
    if (isFarmInterestedInOrganic.interested) {
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
    if (!isFarmInterestedInOrganic.interested) {
      if (body.organic !== null || body.searched !== null || body.genetically_engineered !== null) {
        return res
          .status(400)
          .send({
            message: 'This farm is not interested in organic certification, data should be null',
          });
      }
    }
  } else {
    return res.status(400).send({ message: 'Did not receive farm_id' });
  }
  return next();
}

export default organicCertifierCheck;
