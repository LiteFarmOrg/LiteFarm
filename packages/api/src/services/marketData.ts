/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
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

import FarmModel from '../models/farmModel.js';

export const getMarketListingData = async (farm_id: string) => {
  // check for participation in this program against the FarmAddonModel

  // Grab data already on the farm record
  const farmRecord = await FarmModel.getFarmById(farm_id);

  const { address, country_name, farm_name, farm_phone_number } = farmRecord;

  // I think email, website, etc might need to go on a different DB table? Or just more columns here?

  return {
    address,
    country: country_name,
    farm_name,
    phone_number: farm_phone_number,
    farm_id,
  };
};
