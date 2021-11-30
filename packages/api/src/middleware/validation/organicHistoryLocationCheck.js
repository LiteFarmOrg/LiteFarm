const locationModel = require('../../models/locationModel');
const organicHistoryLocations = [
  'field', 'garden', 'greenhouse',
];

async function organicHistoryLocationCheck(req, res, next) {
  const location = await locationModel.query().join('figure', 'figure.location_id', 'location.location_id')
    .where('location.location_id', req.body.location_id)
    .whereIn('type', organicHistoryLocations);
  if (!location.length) return res.status(400).send('Location must be crop enabled.');
  return next();


}

async function organicHistoryCheckOnPut(req, res, next) {
  const location = await locationModel.query().findById(req.params.location_id).withGraphJoined('[figure, field, garden, greenhouse]');
  if (location && organicHistoryLocations.includes(location.figure.type)) {
    req.body[location.figure.type].organic_history =
      req.body[location.figure.type].organic_status === location[location.figure.type].organic_status ?
        undefined :
        {
          organic_status: req.body[location.figure.type].organic_status,
          effective_date: req.body[location.figure.type].organic_history.effective_date,
        };
  }
  return next();
}

async function organicHistoryCheckOnPost(req, res, next) {
  if (organicHistoryLocations.includes(req.body.figure.type)) {
    req.body[req.body.figure.type].organic_history.organic_status = req.body[req.body.figure.type].organic_status;
  }
  return next();
}

module.exports = { organicHistoryLocationCheck, organicHistoryCheckOnPut, organicHistoryCheckOnPost };
