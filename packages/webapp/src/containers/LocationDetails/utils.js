import { useMemo } from 'react';
import { barnEnum, fieldEnum, greenhouseEnum, surfaceWaterEnum } from '../constants';

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

const boolToString = (bool) => {
  if (bool === true) return 'true';
  else if (bool === false) return 'false';
  else return undefined;
};

export const getFormData = (location) => {
  const result = { ...location };
  result[fieldEnum.transition_date] &&
    (result[fieldEnum.transition_date] = new Date(
      result[fieldEnum.transition_date],
    ).toLocaleDateString('en-CA'));
  result.hasOwnProperty(barnEnum.wash_and_pack) &&
    (result[barnEnum.wash_and_pack] = boolToString(result[barnEnum.wash_and_pack]));
  result.hasOwnProperty(barnEnum.cold_storage) &&
    (result[barnEnum.cold_storage] = boolToString(result[barnEnum.cold_storage]));
  result.hasOwnProperty(greenhouseEnum.supplemental_lighting) &&
    (result[greenhouseEnum.supplemental_lighting] = boolToString(
      result[greenhouseEnum.supplemental_lighting],
    ));
  result.hasOwnProperty(greenhouseEnum.co2_enrichment) &&
    (result[greenhouseEnum.co2_enrichment] = boolToString(result[greenhouseEnum.co2_enrichment]));
  result.hasOwnProperty(greenhouseEnum.greenhouse_heated) &&
    (result[greenhouseEnum.greenhouse_heated] = boolToString(
      result[greenhouseEnum.greenhouse_heated],
    ));
  result.hasOwnProperty(surfaceWaterEnum.used_for_irrigation) &&
    (result[surfaceWaterEnum.used_for_irrigation] = boolToString(
      result[surfaceWaterEnum.used_for_irrigation],
    ));

  return result;
};
