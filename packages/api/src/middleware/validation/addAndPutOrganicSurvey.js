/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (authFarmId.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

async function validateOrganicSurvey(req, res, next) {
  const {
    certification_id,
    certifier_id,
    requested_certification,
    requested_certifier,
    interested,
  } = req.body;
  if (interested && certification_id && requested_certification) {
    return res.status(400).send('One of certification_id and requested_certification must be null');
  } else if (interested && !certification_id && !requested_certification) {
    return res
      .status(400)
      .send('certification_id and requested_certification cannot be null at the same time');
  } else if (interested && certifier_id && requested_certifier) {
    return res.status(400).send('One of certifier_id and requested_certifier must be null');
  } else if (interested && !certifier_id && !requested_certifier) {
    return res
      .status(400)
      .send('certifier_id and requested_certifier cannot be null at the same time');
  } else if (
    !interested &&
    (certification_id || requested_certification || certifier_id || requested_certifier)
  ) {
    req.body.requested_certification = null;
    req.body.certification_id = null;
    req.body.certifier_id = null;
    req.body.requested_certifier = null;
  }
  return next();
}

export default validateOrganicSurvey;
