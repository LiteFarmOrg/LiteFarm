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

const clean = (location: InternalMapLocation) => {
  const locationType = location.figure.type;
  const figureType = location.figure[FigureType.AREA]
    ? FigureType.AREA
    : location.figure[FigureType.LINE]
    ? FigureType.LINE
    : location.figure[FigureType.POINT]
    ? FigureType.POINT
    : null;

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

const useLocations = ({ farm_id }: { farm_id: string }) => {
  const { data: locations = [], isLoading } = useGetLocationsQuery({ farm_id });

  if (isLoading) {
    return { locations: [], isLoading };
  }

  const cleanedLocations = locations.map(clean);

  // how do I sort locations?
  // drawingType, loctionTypes
  return { locations: cleanedLocations, isLoading };
};

export default useLocations;
