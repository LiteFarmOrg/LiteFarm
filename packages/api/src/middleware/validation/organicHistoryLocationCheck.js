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

module.exports = organicHistoryLocationCheck;
