import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { barnEnum, fenceEnum, fieldEnum, greenhouseEnum, surfaceWaterEnum } from '../constants';
import moment from 'moment';

const isCreateLocationPage = (pathname) => pathname.includes('/create_location/');

// React Router v6: Check route pattern using pathname instead of match.path
const isLocationPage = (pathname, locationId, suffix) =>
  new RegExp(`\\w*/${locationId}/${suffix}`).test(pathname);

export const useLocationPageType = () => {
  const { pathname } = useLocation();
  const { location_id } = useParams();

  return useMemo(
    () => ({
      isCreateLocationPage: isCreateLocationPage(pathname),
      isViewLocationPage: isLocationPage(pathname, location_id, 'details'),
      isEditLocationPage: isLocationPage(pathname, location_id, 'edit'),
    }),
    [pathname, location_id],
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
