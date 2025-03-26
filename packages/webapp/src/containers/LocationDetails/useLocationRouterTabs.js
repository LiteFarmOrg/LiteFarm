import { useTranslation } from 'react-i18next';
import useFieldTechnology from './LocationFieldTechnology/useFieldTechnology';

const cropLocations = ['field', 'garden', 'greenhouse', 'buffer_zone'];
const fieldTechnologyLocations = ['field', 'garden', 'greenhouse'];

export default function useLocationRouterTabs(location, match) {
  const { t } = useTranslation();

  const { type } = location;
  const fieldTechnology = useFieldTechnology(location);
  const locationFieldTechnology = Object.keys(fieldTechnology).some(
    (key) => !!fieldTechnology[key].length,
  )
    ? true
    : false;

  let currentTab;
  if (match.path.includes('/details')) {
    currentTab = 'details';
  } else if (match.path.includes('/tasks')) {
    currentTab = 'tasks';
  } else if (match.path.includes('/crops')) {
    currentTab = 'crops';
  } else if (match.path.includes('/field_technology')) {
    currentTab = 'field_technology';
  }

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

  // Order reflects tab order
  if (cropLocations.includes(type)) {
    routerTabs.push({
      label: t('FARM_MAP.TAB.CROPS'),
      path: match.url.replace(currentTab, 'crops'),
    });
  }
  if (locationFieldTechnology && fieldTechnologyLocations.includes(type)) {
    routerTabs.push({
      label: t('FARM_MAP.TAB.FIELD_TECHNOLOGY'),
      path: match.url.replace(currentTab, 'field_technology'),
    });
  }

  return routerTabs;
}
