async function validateRequest(req, res, next) {
  const partnerId = parseInt(req.params.partner_id);
  if (partnerId !== 1) {
    next();
  } else {
    const farmId = req.params.farm_id;
    const authKey = `${farmId}${process.env.SENSOR_SECRET}`;
    if (req.headers.authorization === authKey) {
      next();
    } else {
      res.status(403).send('Not authorized to add readings');
    }
  }
}

export default validateRequest;
