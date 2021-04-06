import { useMemo } from 'react';

const isCreateLocationPage = (match) => match.path.includes('/create_location/');
const isViewLocationPage = (match) => /\w*_detail\/:location_id/.test(match.path);
const isEditLocationPage = (match) => /edit_\w*\/:location_id/.test(match.path);
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
