/*
 *  Copyright 2026 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Location } from '../../../types';
import styles from './styles.module.scss';
import navStyles from '@navStyles';

interface LocationListProps {
  locations: Location[];
  isTransplantTask: boolean;
  selectedLocationIds?: Location['location_id'][];
}

export default function LocationList({
  locations,
  isTransplantTask,
  selectedLocationIds,
}: LocationListProps) {
  const { t } = useTranslation();

  if (!locations?.length) {
    return null;
  }

  if (isTransplantTask) {
    const transplantLocation = locations.find(
      ({ location_id }) => location_id === selectedLocationIds?.[0],
    );
    // When transplanting to the same location, currentLocation becomes transplantLocation
    const currentLocation =
      locations.find(({ location_id }) => location_id !== selectedLocationIds?.[0]) ||
      transplantLocation;

    return (
      <ul className={clsx(styles.locationList, navStyles.showWhenOffline)}>
        <li>
          {t('TASK.CURRENT')}: {currentLocation?.name}
        </li>
        <li>
          {t('TASK.TRANSPLANT')}: {transplantLocation?.name}
        </li>
      </ul>
    );
  }

  return (
    <ul className={clsx(styles.locationList, navStyles.showWhenOffline)}>
      {locations.map((location) => {
        return <li key={location.location_id}>{location.name}</li>;
      })}
    </ul>
  );
}
