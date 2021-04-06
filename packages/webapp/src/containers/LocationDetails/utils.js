import { useMemo } from 'react';

const isCreateLocationPage = (match) => match.path.includes('/create_location/');
const isViewLocationPage = (match) => match.path.includes('_detail/:location_id');
const isEditLocationPage = (match) =>
  /edit_.*\/:location_id\/detail/.test(match.path.includes('/create_location/'));
export const useLocationPageType = (match) => {
  return useMemo(
    () => ({
      isCreateLocationPage: isCreateLocationPage(match),
      isViewLocationPage: isViewLocationPage(match) || false,
      isEditLocationPage: isEditLocationPage(match) || false,
    }),
    [match],
  );
};
