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

const checkParamAgainstBody = (param) => async (req, res, next) => {
  if (!(param in req.body)) {
    return res.status(400).send('param should be provided in body');
  } else if (!(req.body[param] === parseInt(req.params[param]))) {
    return res.status(400).send('param should match body');
  }
  next();
};

export default checkParamAgainstBody;
