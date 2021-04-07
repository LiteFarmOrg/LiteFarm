import { useMemo } from 'react';

const isCreateLocationPage = (match) => match.path.includes('/create_location/');
const isViewLocationPage = (match) => /\w*\/:location_id\/details/.test(match.path);
const isEditLocationPage = (match) => /\w*\/:location_id\/edit/.test(match.path);
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
