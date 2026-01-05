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

import { useGetLocationsQuery } from '../../store/api/locationApi';
import { FigureType, InternalMapLocation, InternalMapLocationType } from '../../store/api/types';
import {
  FlattenedInternalMapLocation,
  GroupByOptions,
  LocationsGroupedByFigure,
  LocationsGroupedByFigureAndType,
  LocationsGroupedByType,
  UseLocationsPropsWithFilterBy,
  UseLocationsPropsWithGroupBy,
  UseLocationsReturn,
} from './types';

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

const clean = (location: InternalMapLocation): any => {
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

const flatten = (location: any): FlattenedInternalMapLocation => {
  const clone: InternalMapLocation = { ...location };
  let flattened = {} as any;
  const locationType = clone.figure.type;
  const figureType = getFigureType(clone.figure);

  // Copy over core values
  for (const [key, value] of Object.entries(clone)) {
    if (key !== locationType && key !== 'figure') {
      flattened[key] = value;
    }
  }

  // Flatten location type payload (e.g. barn, field)
  if (locationType && clone[locationType]) {
    const payload = clone[locationType];

    // Keep properties, skipping location_id
    for (const [key, value] of Object.entries(payload)) {
      if (key !== 'location_id') {
        flattened[key] = value;
      }
    }
  }

  // Flatten figure into top level
  if (clone.figure) {
    const figure = clone.figure;
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

type InternalLocationProps = {
  farm_id: string;
};

type UseInternalLocationPropsWithFilterBy = UseLocationsPropsWithFilterBy<
  InternalMapLocationType,
  InternalLocationProps
>;

type UseInternalLocationPropsWithGroupBy = UseLocationsPropsWithGroupBy<InternalLocationProps>;
type UseInternalLocationProps =
  | UseInternalLocationPropsWithFilterBy
  | UseInternalLocationPropsWithGroupBy;

// Function overloads to correctly infer types based on props
function useLocations(
  props: UseInternalLocationPropsWithFilterBy & { filterBy: InternalMapLocationType | FigureType },
): UseLocationsReturn<FlattenedInternalMapLocation[] | undefined>;

function useLocations(
  props: UseInternalLocationPropsWithGroupBy & { groupBy: GroupByOptions.TYPE },
): UseLocationsReturn<
  LocationsGroupedByType<InternalMapLocationType, FlattenedInternalMapLocation> | undefined
>;

function useLocations(
  props: UseInternalLocationPropsWithGroupBy & { groupBy: GroupByOptions.FIGURE },
): UseLocationsReturn<LocationsGroupedByFigure<FlattenedInternalMapLocation> | undefined>;

function useLocations(
  props: UseInternalLocationPropsWithGroupBy & { groupBy: GroupByOptions.FIGURE_AND_TYPE },
): UseLocationsReturn<
  LocationsGroupedByFigureAndType<InternalMapLocationType, FlattenedInternalMapLocation> | undefined
>;

function useLocations(
  props: InternalLocationProps,
): UseLocationsReturn<FlattenedInternalMapLocation[] | undefined>;

function useLocations({ farm_id, filterBy, groupBy }: UseInternalLocationProps): any {
  const { data: locations, isLoading } = useGetLocationsQuery({ farm_id });

  if (isLoading) {
    return { locations, isLoading };
  }

  if (locations && locations.length) {
    const cleanedLocations = locations.map(clean);
    const flattenedLocations = cleanedLocations.map(flatten);
    const activeLocations = flattenedLocations.filter(({ deleted }) => deleted === false);

    if (filterBy && allLocationTypes.includes(filterBy)) {
      const filteredLocations = activeLocations.filter(({ type }) => type === filterBy);
      return { locations: filteredLocations, isLoading };
    }

    if (filterBy && allFigureTypes.includes(filterBy)) {
      const filteredLocations = activeLocations.filter(
        ({ figure_type }) => figure_type === filterBy,
      );
      return { locations: filteredLocations, isLoading };
    }

    if (groupBy === GroupByOptions.TYPE) {
      const groupedLocations = Object.groupBy(activeLocations, ({ type }) => type);
      return { locations: groupedLocations, isLoading };
    }

    if (groupBy === GroupByOptions.FIGURE) {
      const groupedLocations = Object.groupBy(activeLocations, ({ figure_type }) => figure_type);
      return { locations: groupedLocations, isLoading };
    }

    if (groupBy === GroupByOptions.FIGURE_AND_TYPE) {
      // First: group by figure type (area, line, point)
      const groupedByFigure = Object.groupBy(activeLocations, ({ figure_type }) => figure_type);

      // Second: for each figure group, group by location type
      const groupedLocations = Object.fromEntries(
        Object.entries(groupedByFigure).map(([figureType, locations]) => {
          const groupedByLocationType = Object.groupBy(locations, ({ type }) => type);
          return [figureType, groupedByLocationType];
        }),
      );

      return { locations: groupedLocations, isLoading };
    }

    return { locations: activeLocations, isLoading };
  }

  return { locations, isLoading };
}

export default useLocations;
