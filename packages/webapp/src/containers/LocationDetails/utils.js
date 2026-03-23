import { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  areaProperties,
  fieldEnum,
  figureProperties,
  lineProperties,
  locationProperties,
  pointProperties,
} from '../constants';
import moment from 'moment';
import { pick } from '../../util/pick';
import { InternalMapLocationType } from '../../store/api/types';
import { getDateInputFormat } from '../../util/moment';

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

export const getFormData = (location) => {
  const result = { ...location };
  result[fieldEnum.transition_date] &&
    (result[fieldEnum.transition_date] = moment(result[fieldEnum.transition_date])
      .utc()
      .format('YYYY-MM-DD'));

  return result;
};

const propertiesToPick = {
  // areas
  barn: ['wash_and_pack', 'cold_storage', 'used_for_animals', 'location_id'],
  ceremonial_area: ['location_id'],
  farm_site_boundary: ['location_id'],
  field: ['station_id', 'organic_status', 'transition_date', 'location_id'],
  garden: ['station_id', 'organic_status', 'transition_date', 'location_id'],
  greenhouse: [
    'organic_status',
    'transition_date',
    'supplemental_lighting',
    'co2_enrichment',
    'greenhouse_heated',
    'location_id',
  ],
  natural_area: ['location_id'],
  residence: ['location_id'],
  surface_water: ['used_for_irrigation', 'location_id'],
  // lines
  buffer_zone: ['location_id'],
  fence: ['pressure_treated', 'location_id'],
  watercourse: [
    'used_for_irrigation',
    'includes_riparian_buffer',
    'buffer_width',
    'buffer_width_unit',
    'location_id',
  ],
  // points
  gate: ['location_id'],
  soil_sample_location: ['location_id'],
};

const getFigureTypeProperties = (data, locationType) => {
  switch (locationType) {
    case InternalMapLocationType.BARN:
    case InternalMapLocationType.CEREMONIAL_AREA:
    case InternalMapLocationType.FARM_SITE_BOUNDARY:
    case InternalMapLocationType.FIELD:
    case InternalMapLocationType.GARDEN:
    case InternalMapLocationType.GREENHOUSE:
    case InternalMapLocationType.NATURAL_AREA:
    case InternalMapLocationType.RESIDENCE:
    case InternalMapLocationType.SURFACE_WATER:
      return { area: pick(data, areaProperties) };
    case InternalMapLocationType.BUFFER_ZONE:
    case InternalMapLocationType.FENCE:
    case InternalMapLocationType.WATERCOURSE:
      return { line: pick(data, lineProperties) };
    case InternalMapLocationType.GATE:
    case InternalMapLocationType.SOIL_SAMPLE_LOCATION:
      return { point: pick(data, pointProperties) };
    default:
      throw new Error(`Unknown location type ${locationType}`);
  }
};

const getOrganicHistoryProperties = (data, locationType) => {
  switch (locationType) {
    case InternalMapLocationType.FIELD:
    case InternalMapLocationType.GARDEN:
    case InternalMapLocationType.GREENHOUSE:
      return {
        organic_history: {
          effective_date: getDateInputFormat(),
          organic_status: data.organic_status,
        },
      };
    default:
      return {};
  }
};

export const formatLocationTypeToLocationForDB = (data, locationType) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      ...getFigureTypeProperties(data, locationType),
    },
    [locationType]: {
      ...pick(data, propertiesToPick[locationType]),
      ...getOrganicHistoryProperties(data, locationType),
    },
    ...pick(data, locationProperties),
  };
};
