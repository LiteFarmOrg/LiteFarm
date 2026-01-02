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

import { useGetSensorsQuery } from '../../store/api/apiSlice';
import { FigureType } from '../../store/api/types';
import { ExternalLocations, ExternalMapLocationType, ExternalPoints } from './types';

const allLocationTypes = Object.values(ExternalMapLocationType) as readonly string[];
const allFigureTypes = Object.values(FigureType) as readonly string[];

enum GroupByOptions {
  TYPE = 'type',
  FIGURE = 'figure',
  FIGURE_AND_TYPE = 'figure_and_type',
}

type UseExternalLocationPropsWithFilterBy = {
  filterBy?: ExternalMapLocationType | FigureType;
  groupBy?: never;
};

type UseExternalLocationPropsWithGroupBy = {
  filterBy?: never;
  groupBy?: GroupByOptions;
};

const useExternalLocations = ({
  filterBy,
  groupBy,
}: UseExternalLocationPropsWithFilterBy | UseExternalLocationPropsWithGroupBy) => {
  const { data: sensorData, isLoading: isLoadingSensors } = useGetSensorsQuery();

  const isLoading = isLoadingSensors;

  if (isLoading) {
    return { locations: sensorData, isLoading };
  }

  const allSensors =
    sensorData?.sensors.map((sensor) => ({
      ...sensor,
      isAddonSensor: true,
      type: ExternalMapLocationType.SENSOR,
      figure_type: FigureType.POINT,
    })) || [];

  const sensorArrays =
    sensorData?.sensor_arrays.map((sensorArray) => ({
      ...sensorArray,
      isAddonSensor: true,
      type: ExternalMapLocationType.SENSOR_ARRAY,
      figure_type: FigureType.POINT,
    })) || [];

  const standaloneSensors = allSensors?.filter((sensor) => sensor.sensor_array_id === null) || [];

  const locations = [...sensorArrays, ...standaloneSensors];

  if (locations.length && (filterBy || groupBy)) {
    if (filterBy && allLocationTypes.includes(filterBy)) {
      const filteredLocations = locations.filter(({ type }) => type === filterBy);
      return { locations: filteredLocations, isLoading };
    }

    if (filterBy && allFigureTypes.includes(filterBy)) {
      const filteredLocations = locations.filter(({ figure_type }) => figure_type === filterBy);
      return { locations: filteredLocations, isLoading };
    }

    if (groupBy === GroupByOptions.TYPE) {
      const groupedLocations = Object.groupBy(locations, ({ type }) => type);
      return { locations: groupedLocations, isLoading };
    }

    if (groupBy === GroupByOptions.FIGURE) {
      const groupedLocations = Object.groupBy(locations, ({ figure_type }) => figure_type);
      return { locations: groupedLocations, isLoading };
    }

    if (groupBy === GroupByOptions.FIGURE_AND_TYPE) {
      // First: group by figure type (area, line, point)
      const groupedByFigure = Object.groupBy(locations, ({ figure_type }) => figure_type);

      // Second: for each figure group, group by location type
      const groupedLocations = Object.fromEntries(
        Object.entries(groupedByFigure).map(([figureType, locations]) => {
          const groupedByLocationType = Object.groupBy(locations, ({ type }) => type);
          return [figureType, groupedByLocationType];
        }),
      );

      return { locations: groupedLocations, isLoading };
    }
  }

  return {
    locations,
    isLoading,
  };
};

export default useExternalLocations;
