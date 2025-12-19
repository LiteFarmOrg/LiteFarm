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

const clean = (location: InternalMapLocation) => {
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

enum GroupByOptions {
  TYPE = 'type',
  FIGURE = 'figure',
  FIGURE_AND_TYPE = 'figure_and_type',
}

type UseLocationPropsWithFilterBy = {
  farm_id: string;
  filterBy?: InternalMapLocationType | FigureType;
  groupBy?: never;
};

type UseLocationPropsWithGroupBy = {
  farm_id: string;
  filterBy?: never;
  groupBy?: GroupByOptions;
};

const useLocations = ({
  farm_id,
  filterBy,
  groupBy,
}: UseLocationPropsWithFilterBy | UseLocationPropsWithGroupBy) => {
  const { data: locations = [], isLoading } = useGetLocationsQuery({ farm_id });

  if (isLoading) {
    return { locations: [], isLoading };
  }

  const cleanedLocations = locations.map(clean);

  if (filterBy && allLocationTypes.includes(filterBy)) {
    const filteredLocations = cleanedLocations.filter(
      (location) => location.figure.type === filterBy,
    );
    return { locations: filteredLocations, isLoading };
  }

  if (filterBy && allFigureTypes.includes(filterBy)) {
    const filteredLocations = cleanedLocations.filter((location) => !!location.figure[filterBy]);
    return { locations: filteredLocations, isLoading };
  }

  if (groupBy === GroupByOptions.TYPE) {
    const groupedLocations = Object.groupBy(cleanedLocations, ({ figure }) => figure.type);
    return { locations: groupedLocations, isLoading };
  }

  if (groupBy === GroupByOptions.FIGURE) {
    const groupedLocations = Object.groupBy(
      cleanedLocations,
      ({ figure }) => getFigureType(figure) ?? 'never',
    );
    return { locations: groupedLocations, isLoading };
  }

  if (groupBy === GroupByOptions.FIGURE_AND_TYPE) {
    // First: group by figure type (area, line, point)
    const groupedByFigure = Object.groupBy(
      cleanedLocations,
      ({ figure }) => getFigureType(figure) ?? 'never', // TODO: Better solution this will never happen
    );

    // Second: for each figure group, group by location type
    const groupedLocations = Object.fromEntries(
      Object.entries(groupedByFigure).map(([geometryType, locations]) => {
        const groupedByLocationType = Object.groupBy(locations, ({ figure }) => figure.type);
        return [geometryType, groupedByLocationType];
      }),
    );

    return { locations: groupedLocations, isLoading };
  }

  return { locations: cleanedLocations, isLoading };
};

export default useLocations;
