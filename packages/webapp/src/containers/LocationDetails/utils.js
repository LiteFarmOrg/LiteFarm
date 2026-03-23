import { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  areaProperties,
  barnEnum,
  fenceEnum,
  fieldEnum,
  figureProperties,
  greenhouseEnum,
  locationProperties,
  surfaceWaterEnum,
} from '../constants';
import moment from 'moment';
import { get } from 'lodash-es';
import { pick } from '../../util/pick';
import { InternalMapLocationType } from '../../store/api/types';

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

const propertiesToPick = {
  barn: ['wash_and_pack', 'cold_storage', 'used_for_animals', 'location_id'],
  ceremonial_area: ['location_id'],
};

const getFigureTypeProperties = (data, locationType) => {
  switch (locationType) {
    case InternalMapLocationType.BARN:
    case InternalMapLocationType.CEREMONIAL_AREA:
      return { area: pick(data, areaProperties) };
    default:
      throw new Error(`Unknown location type ${locationType}`);
  }
};

export const formatLocationTypeToLocationForDB = (data, locationType) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      ...getFigureTypeProperties(data, locationType),
    },
    [locationType]: pick(data, propertiesToPick[locationType]),
    ...pick(data, locationProperties),
  };
};
