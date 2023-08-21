/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import { ReactComponent as SensorIcon } from '../../assets/images/farmMapFilter/Sensor.svg';

/**
 * Provides the appropriate icon for a specified notification type.
 * @param {string} key - A translation key that specifies a notification type.
 * @returns {ReactComponent | undefined} The icon for the specified notification type.
 */
export default function getNotificationTypeIcon(key) {
  const iconDict = {
    SENSOR: SensorIcon,
  };

  return iconDict[key];
}
