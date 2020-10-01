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

async function isSelf(req, res, next) {
  const user_id = req.user.sub.split('|')[1];
  if(req.body.user_id && req.body.user_id !== user_id){
    return res.status(403).send('User is not authorized to access user info');
  }else if(req.params.user_id && user_id !== req.params.user_id){
    return res.status(403).send('User is not authorized to access user info');
  }else if(req.headers.user_id && user_id !== req.headers.user_id){
    return res.status(403).send('User is not authorized to access user info');
  }else{
    return next();
  }
}

module.exports = isSelf;
