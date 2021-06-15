
const organicCertifierModel = require('./../models/organicCertifierSurveyModel');

async function organicCertifierCheck(req, res, next) { // express
  const { body } = req;
  if (body.farm_id) {
    const isFarmInterestedInOrganic = await organicCertifierModel.query().where({ farm_id: body.farm_id }) // objection: query organicCertifierModel where farm_id == body.farm_id
    if(isFarmInterestedInOrganic.interested) { // farm is interested in organic certification
      if(body.organic === null){          // crop variety organic field is null but farm is interested in organic certification
        return res.status(400).send({ message: 'Organic can\'t be null' }); // return error
      }
      if(!body.organic && (body.searched === null || body.genetically_engineered === null)) { // crop is not organic but searched and genetically engineered questions are null
        return res.status(400).send({ message: 'Organic can\'t be null' }); // return error
      }
      if(body.organic && (body.searched !== null || body.genetically_engineered !== null)) { // crop is organic but searched and genetically engineered questions are not null (they should be null)
        return res.status(400).send({ message: 'Organic should be null' });
      }
    }
    if(!isFarmInterestedInOrganic.interested) { // farm is not interested in organic certification
      if(body.organic !== null || body.searched !== null || body.genetically_engineered !== null) {
        return res.status(400).send({ message: 'This farm is not interested in organic certification, data should be null' });
      }
    }
  } else {
    return res.status(400).send({ message: 'Did not receive farm_id' });
  }
  return next();
}

module.exports = organicCertifierCheck;
