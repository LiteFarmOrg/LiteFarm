import locationModel from '../../models/locationModel.js';
import moment from 'moment';
const organicHistoryLocations = ['field', 'garden', 'greenhouse'];

async function organicHistoryLocationCheckOnPost(req, res, next) {
  const location = await locationModel
    .query()
    .join('figure', 'figure.location_id', 'location.location_id')
    .where('location.location_id', req.body.location_id)
    .whereIn('type', organicHistoryLocations);
  if (!location.length) return res.status(400).send('Location must be crop enabled.');
  return next();
}

async function organicHistoryCheckOnPut(req, res, next) {
  const location = await locationModel
    .query()
    .findById(req.params.location_id)
    .withGraphJoined(
      '[figure, field.[organic_history], garden.[organic_history], greenhouse.[organic_history]]',
    );
  if (location && organicHistoryLocations.includes(location.figure.type)) {
    const effective_date = req.body[location.figure.type].organic_history.effective_date;
    const organic_history_id = location[location.figure.type].organic_history.find(
      (organicHistoryStatus) => {
        return (
          moment(organicHistoryStatus.effective_date).utc().format('YYYY-MM-DD') === effective_date
        );
      },
    )?.organic_history_id;

    req.body[location.figure.type].organic_history =
      req.body[location.figure.type].organic_status ===
      location[location.figure.type].organic_status
        ? undefined
        : {
            organic_history_id,
            organic_status: req.body[location.figure.type].organic_status,
            effective_date,
          };
  }
  return next();
}

async function organicHistoryCheckOnPost(req, res, next) {
  if (organicHistoryLocations.includes(req.body.figure.type)) {
    req.body[req.body.figure.type].organic_history.organic_status =
      req.body[req.body.figure.type].organic_status;
  }
  return next();
}

export { organicHistoryLocationCheckOnPost, organicHistoryCheckOnPut, organicHistoryCheckOnPost };
