/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { groupBy as lodashGroupBy } from 'lodash-es';
import { useGetLocationsQuery } from '../../store/api/locationApi';
import { FigureType, InternalMapLocation, InternalMapLocationType } from '../../store/api/types';
import {
  FigureTypeToFlattened,
  FlattenedInternalMapLocation,
  FlattenedMapLocationByType,
  GroupByOptions,
  LocationsGroupedByFigure,
  LocationsGroupedByFigureAndType,
  LocationsGroupedByType,
  UseLocationsPropsWithFilterBy,
  UseLocationsPropsWithGroupBy,
  UseLocationsReturn,
} from './types';

// Polyfill for tests and older browsers
const groupByFn = typeof Object.groupBy === 'function' ? Object.groupBy : lodashGroupBy;

const allLocationTypes = Object.values(InternalMapLocationType) as readonly string[];
const allFigureTypes = Object.values(FigureType) as readonly string[];

const getFigureType = (figure: InternalMapLocation['figure']) => {
  if (figure[FigureType.AREA]) {
    return FigureType.AREA;
  } else if (figure[FigureType.LINE]) {
    return FigureType.LINE;
  } else if (figure[FigureType.POINT]) {
    return FigureType.POINT;
  } else {
    return null;
  }
};

export const clean = (location: InternalMapLocation): any => {
  const locationType = location.figure.type;
  const figureType = getFigureType(location.figure);

  // Removes the not applicable location type properties but keeps the rest
  const cleanedLocation = locationType
    ? Object.fromEntries(
        Object.entries(location).filter(
          ([key]) => !allLocationTypes.includes(key) || key === locationType,
        ),
      )
    : location;

  const cleanedFigure = figureType
    ? Object.fromEntries(
        Object.entries(location.figure).filter(([key]) => {
          // Keep shared figure props (type, location_id, figure_id)
          // OR the active geometry key
          return !allFigureTypes.includes(key) || key === figureType;
        }),
      )
    : location.figure;

  cleanedLocation.figure = cleanedFigure;

  return cleanedLocation;
};

export const flatten = (location: any): FlattenedInternalMapLocation => {
  const flattened = {} as any;
  const locationType = location.figure.type;
  const figureType = getFigureType(location.figure);

  // Copy over core values
  for (const [key, value] of Object.entries(location)) {
    if (key !== locationType && key !== 'figure') {
      flattened[key] = value;
    }
  }

  // Flatten location type payload (e.g. barn, field)
  if (locationType && location[locationType]) {
    const payload = location[locationType];

    // Keep properties, skipping location_id
    for (const [key, value] of Object.entries(payload)) {
      if (key !== 'location_id') {
        flattened[key] = value;
      }
    }
  }

  // Flatten figure into top level
  if (location.figure) {
    const figure = location.figure;
    for (const [key, value] of Object.entries(figure)) {
      if (key !== figureType && key !== 'location_id') {
        flattened[key] = value;
      }
    }
    // Flatten figure if present
    if (figureType && figure[figureType]) {
      const figureData = figure[figureType];

      // keep data for usefullness
      flattened['figure_type'] = figureType;

      for (const [key, value] of Object.entries(figureData)) {
        if (key !== 'figure_id') {
          flattened[key] = value;
        }
      }
    }
  }

  return flattened;
};

type UseInternalLocationsPropsWithFilterBy = UseLocationsPropsWithFilterBy<InternalMapLocationType>;

type UseInternalLocationProps =
  | UseInternalLocationsPropsWithFilterBy
  | UseLocationsPropsWithGroupBy;

// Function overloads to correctly infer types based on props
function useLocations<T extends InternalMapLocationType>(
  props: UseInternalLocationsPropsWithFilterBy & { filterBy: T },
): UseLocationsReturn<FlattenedMapLocationByType[T][] | undefined>;

function useLocations<T extends InternalMapLocationType[]>(
  props: UseInternalLocationsPropsWithFilterBy & { filterBy: T },
): UseLocationsReturn<FlattenedMapLocationByType[T[number]][] | undefined>;

function useLocations<T extends FigureType>(
  props: UseInternalLocationsPropsWithFilterBy & { filterBy: T },
): UseLocationsReturn<FigureTypeToFlattened[T][] | undefined>;

function useLocations(
  props: UseLocationsPropsWithGroupBy & { groupBy: GroupByOptions.TYPE },
): UseLocationsReturn<
  LocationsGroupedByType<InternalMapLocationType, FlattenedInternalMapLocation> | undefined
>;

function useLocations(
  props: UseLocationsPropsWithGroupBy & { groupBy: GroupByOptions.FIGURE },
): UseLocationsReturn<LocationsGroupedByFigure<FlattenedInternalMapLocation> | undefined>;

function useLocations(
  props: UseLocationsPropsWithGroupBy & { groupBy: GroupByOptions.FIGURE_AND_TYPE },
): UseLocationsReturn<
  LocationsGroupedByFigureAndType<InternalMapLocationType, FlattenedInternalMapLocation> | undefined
>;

function useLocations(
  props?: undefined | UseInternalLocationProps,
): UseLocationsReturn<FlattenedInternalMapLocation[] | undefined>;

function useLocations(
  { filterBy, groupBy, deleted }: UseInternalLocationProps = { deleted: false },
): any {
  const { data: rawLocations, isLoading, isFetching } = useGetLocationsQuery();

  // Deep clone to prevent mutating original data from cache
  const locations = rawLocations?.map((rawLocation) => structuredClone(rawLocation));

  if (isLoading || !locations?.length) {
    return { locations, isLoading, isFetching };
  }

  const activeLocations = deleted
    ? locations
    : locations.filter(({ deleted }) => deleted === false);
  const cleanedLocations = activeLocations.map(clean);
  const flattenedLocations = cleanedLocations.map(flatten);

  if (Array.isArray(filterBy)) {
    const filteredLocations = flattenedLocations.filter(({ type }) => filterBy.includes(type));
    return { locations: filteredLocations, isLoading, isFetching };
  }

  if (filterBy && allLocationTypes.includes(filterBy)) {
    const filteredLocations = flattenedLocations.filter(({ type }) => type === filterBy);
    return { locations: filteredLocations, isLoading, isFetching };
  }

  if (filterBy && allFigureTypes.includes(filterBy)) {
    const filteredLocations = flattenedLocations.filter(
      ({ figure_type }) => figure_type === filterBy,
    );
    return { locations: filteredLocations, isLoading, isFetching };
  }

  if (groupBy === GroupByOptions.TYPE) {
    // @ts-expect-error - todo - fix type inference for groupByFn
    const groupedLocations = groupByFn(flattenedLocations, ({ type }) => type);
    return { locations: groupedLocations, isLoading, isFetching };
  }

  if (groupBy === GroupByOptions.FIGURE) {
    // @ts-expect-error - todo - fix type inference for groupByFn
    const groupedLocations = groupByFn(flattenedLocations, ({ figure_type }) => figure_type);
    return { locations: groupedLocations, isLoading, isFetching };
  }

  if (groupBy === GroupByOptions.FIGURE_AND_TYPE) {
    // First: group by figure type (area, line, point)
    // @ts-expect-error - todo - fix type inference for groupByFn
    const groupedByFigure = groupByFn(flattenedLocations, ({ figure_type }) => figure_type);

    // Second: for each figure group, group by location type
    const groupedLocations = Object.fromEntries(
      Object.entries(groupedByFigure).map(([figureType, locations]) => {
        // @ts-expect-error - todo - fix type inference for groupByFn
        const groupedByLocationType = groupByFn(locations, ({ type }) => type);
        return [figureType, groupedByLocationType];
      }),
    );

    return { locations: groupedLocations, isLoading, isFetching };
  }

  return { locations: flattenedLocations, isLoading, isFetching };
}

export default useLocations;
