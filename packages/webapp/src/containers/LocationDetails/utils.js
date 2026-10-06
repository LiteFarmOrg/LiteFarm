import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
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
import { FigureType, InternalMapLocationType } from '../../store/api/types';
import { getDateInputFormat } from '../../util/moment';

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
  barn: ['wash_and_pack', 'cold_storage', 'used_for_animals'],
  ceremonial_area: [],
  farm_site_boundary: [],
  field: ['station_id', 'organic_status', 'transition_date'],
  garden: ['station_id', 'organic_status', 'transition_date'],
  greenhouse: [
    'organic_status',
    'transition_date',
    'supplemental_lighting',
    'co2_enrichment',
    'greenhouse_heated',
  ],
  natural_area: [],
  residence: [],
  surface_water: ['used_for_irrigation'],
  // lines
  buffer_zone: [],
  fence: ['pressure_treated'],
  watercourse: [
    'used_for_irrigation',
    'includes_riparian_buffer',
    'buffer_width',
    'buffer_width_unit',
  ],
  // points
  gate: [],
  soil_sample_location: [],
  water_valve: ['source', 'flow_rate', 'flow_rate_unit'],
};

export const getFigureType = (locationType) => {
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
      return 'area';
    case InternalMapLocationType.BUFFER_ZONE:
    case InternalMapLocationType.FENCE:
    case InternalMapLocationType.WATERCOURSE:
      return 'line';
    case InternalMapLocationType.GATE:
    case InternalMapLocationType.SOIL_SAMPLE_LOCATION:
    case InternalMapLocationType.WATER_VALVE:
      return 'point';
    default:
      throw new Error(`Unknown location type ${locationType}`);
  }
};

const getFigureTypeProperties = (data, locationType) => {
  const figureType = getFigureType(locationType);
  const properties = { area: areaProperties, line: lineProperties, point: pointProperties };
  return { [figureType]: pick(data, properties[figureType]) };
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
      ...pick(data, ['location_id', ...propertiesToPick[locationType]]),
      ...getOrganicHistoryProperties(data, locationType),
    },
    ...pick(data, locationProperties),
  };
};
