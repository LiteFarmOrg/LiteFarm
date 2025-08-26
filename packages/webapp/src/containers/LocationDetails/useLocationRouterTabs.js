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

import { useTranslation } from 'react-i18next';
import useFieldTechnology from './LocationFieldTechnology/useFieldTechnology';
import { locationEnum } from '../Map/constants';
import useIrrigationPrescriptions from './LocationIrrigation/useIrrigationPrescriptions';

const cropLocations = [
  locationEnum.field,
  locationEnum.garden,
  locationEnum.greenhouse,
  locationEnum.buffer_zone,
];
const fieldTechnologyLocations = [
  locationEnum.field,
  locationEnum.garden,
  locationEnum.greenhouse,
  locationEnum.farm_site_boundary,
];
const irrigationPrescriptionLocations = fieldTechnologyLocations;

export default function useLocationRouterTabs(location, match) {
  const { t } = useTranslation();

  if (!location) {
    return [];
  }

  const { type } = location;

  const TABS = ['details', 'tasks', 'crops', 'field_technology', 'irrigation'];

  const currentTab = TABS.find((tab) => match.path.includes(`/${tab}`));

  const fieldTechnology = useFieldTechnology(location);
  const hasLocationFieldTechnology = Object.values(fieldTechnology).some((value) => !!value.length);

  const irrigationPrescriptions = useIrrigationPrescriptions(location);
  const hasLocationIrrigationPrescriptions = !!irrigationPrescriptions.length;

  const routerTabs = [
    {
      label: t('FARM_MAP.TAB.DETAILS'),
      path: match.url.replace(currentTab, 'details'),
    },
    {
      label: t('FARM_MAP.TAB.TASKS'),
      path: match.url.replace(currentTab, 'tasks'),
    },
  ];

  // Order of following statements reflects tab order
  if (cropLocations.includes(type)) {
    routerTabs.push({
      label: t('FARM_MAP.TAB.CROPS'),
      path: match.url.replace(currentTab, 'crops'),
    });
  }
  if (hasLocationFieldTechnology && fieldTechnologyLocations.includes(type)) {
    routerTabs.push({
      label: t('FARM_MAP.TAB.FIELD_TECHNOLOGY'),
      path: match.url.replace(currentTab, 'field_technology'),
    });
  }
  if (hasLocationIrrigationPrescriptions && irrigationPrescriptionLocations.includes(type)) {
    routerTabs.push({
      label: t('FARM_MAP.TAB.IRRIGATION'),
      path: match.url.replace(currentTab, 'irrigation'),
    });
  }

  return routerTabs;
}
