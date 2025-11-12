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

import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../../../userFarmSlice';
import { DIRECTORY_INFO_FIELDS } from './types';
import { UserFarm } from '../../../../../types';

const useDefaultMarketDirectoryData = () => {
  // @ts-expect-error -- userFarmSelector issue
  const userFarm: UserFarm = useSelector(userFarmSelector);

  return {
    [DIRECTORY_INFO_FIELDS.FARM_NAME]: userFarm.farm_name,
    [DIRECTORY_INFO_FIELDS.LOGO]: userFarm.farm_image_url,
    [DIRECTORY_INFO_FIELDS.CONTACT_FIRST_NAME]: userFarm.first_name,
    [DIRECTORY_INFO_FIELDS.CONTACT_LAST_NAME]: userFarm.last_name,
    [DIRECTORY_INFO_FIELDS.CONTACT_EMAIL]: userFarm.email,
    [DIRECTORY_INFO_FIELDS.ADDRESS]: userFarm.address,
    [DIRECTORY_INFO_FIELDS.ABOUT]: '',
    [DIRECTORY_INFO_FIELDS.COUNTRY_CODE]: NaN,
    [DIRECTORY_INFO_FIELDS.PHONE_NUMBER]: '',
    [DIRECTORY_INFO_FIELDS.EMAIL]: '',
    [DIRECTORY_INFO_FIELDS.WEBSITE]: '',
    [DIRECTORY_INFO_FIELDS.INSTAGRAM]: '',
    [DIRECTORY_INFO_FIELDS.FACEBOOK]: '',
    [DIRECTORY_INFO_FIELDS.X]: '',
  };
};

export default useDefaultMarketDirectoryData;
