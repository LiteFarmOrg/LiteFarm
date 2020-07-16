/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (index.js) is part of LiteFarm.
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

const findAuth0Uri = () => {
  const environment = process.env.NODE_ENV || 'development';
  switch (environment) {
  case 'ci':
  case 'integration':
    return 'https://litefarm.auth0.com';
  case 'production':
    return 'https://litefarm-production.auth0.com';
  case 'development':
  default:
    return 'https://litefarm-dev.auth0.com';
  }
};

module.exports = findAuth0Uri;
