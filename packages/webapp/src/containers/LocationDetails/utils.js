import { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { barnEnum, fenceEnum, fieldEnum, greenhouseEnum, surfaceWaterEnum } from '../constants';
import moment from 'moment';

const isCreateLocationPage = (match) => match.path.includes('/create_location/');
const isViewLocationPage = (match) => /\w*\/:location_id\/details/.test(match.path);
const isEditLocationPage = (match) => /\w*\/:location_id\/edit/.test(match.path);
export const useLocationPageType = () => {
  const match = useRouteMatch();
  return useMemo(
    () => ({
      isCreateLocationPage: isCreateLocationPage(match),
      isViewLocationPage: isViewLocationPage(match) || false,
      isEditLocationPage: isEditLocationPage(match) || false,
    }),
    [match],
  );
};

const boolToString = (bool) => {
  if (bool === true) return 'true';
  else if (bool === false) return 'false';
  else return undefined;
};

export const getFormData = (location) => {
  const result = { ...location };
  result[fieldEnum.transition_date] &&
    (result[fieldEnum.transition_date] = moment(result[fieldEnum.transition_date])
      .utc()
      .format('YYYY-MM-DD'));

  return result;
};
