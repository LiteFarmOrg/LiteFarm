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
import { useGetSensorsQuery } from '../../store/api/apiSlice';
import { FigureType } from '../../store/api/types';
import {
  ExternalMapLocation,
  ExternalMapLocationByType,
  ExternalMapLocationType,
  FigureTypeToExternal,
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

const allLocationTypes = Object.values(ExternalMapLocationType) as readonly string[];
const allFigureTypes = Object.values(FigureType) as readonly string[];

type UseExternalLocationsPropsWithFilterBy = UseLocationsPropsWithFilterBy<ExternalMapLocationType>;

type UseExternalLocationProps =
  | UseExternalLocationsPropsWithFilterBy
  | UseLocationsPropsWithGroupBy;

// Function overloads to correctly infer types based on props
function useExternalLocations<T extends ExternalMapLocationType>(
  props: UseExternalLocationsPropsWithFilterBy & { filterBy: T },
): UseLocationsReturn<ExternalMapLocationByType[T][] | undefined>;

function useExternalLocations<T extends ExternalMapLocationType[]>(
  props: UseExternalLocationsPropsWithFilterBy & { filterBy: T },
): UseLocationsReturn<ExternalMapLocationByType[T[number]][] | undefined>;

function useExternalLocations<T extends FigureType>(
  props: UseExternalLocationsPropsWithFilterBy & { filterBy: T },
): UseLocationsReturn<FigureTypeToExternal[T][] | undefined>;

function useExternalLocations(
  props: UseLocationsPropsWithGroupBy & { groupBy: GroupByOptions.TYPE },
): UseLocationsReturn<
  LocationsGroupedByType<ExternalMapLocationType, ExternalMapLocation> | undefined
>;

function useExternalLocations(
  props: UseLocationsPropsWithGroupBy & { groupBy: GroupByOptions.FIGURE },
): UseLocationsReturn<LocationsGroupedByFigure<ExternalMapLocation> | undefined>;

function useExternalLocations(
  props: UseLocationsPropsWithGroupBy & { groupBy: GroupByOptions.FIGURE_AND_TYPE },
): UseLocationsReturn<
  LocationsGroupedByFigureAndType<ExternalMapLocationType, ExternalMapLocation> | undefined
>;

function useExternalLocations(
  props?: UseExternalLocationProps,
): UseLocationsReturn<ExternalMapLocation[] | undefined>;

function useExternalLocations({ filterBy, groupBy }: UseExternalLocationProps = {}): any {
  const {
    data: sensorData,
    isLoading: isLoadingSensors,
    isFetching: isFetchingSensors,
  } = useGetSensorsQuery();

  const isLoading = isLoadingSensors;
  const isFetching = isFetchingSensors;

  if (isLoading) {
    return { locations: sensorData, isLoading, isFetching };
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
      name: sensorArray.label,
    })) || [];

  const standaloneSensors = allSensors?.filter((sensor) => sensor.sensor_array_id === null) || [];

  const locations = [...sensorArrays, ...standaloneSensors];

  if (locations.length && (filterBy || groupBy)) {
    if (Array.isArray(filterBy)) {
      const filteredLocations = locations.filter(({ type }) => filterBy.includes(type));
      return { locations: filteredLocations, isLoading, isFetching };
    }

    if (filterBy && allLocationTypes.includes(filterBy)) {
      const filteredLocations = locations.filter(({ type }) => type === filterBy);
      return { locations: filteredLocations, isLoading, isFetching };
    }

    if (filterBy && allFigureTypes.includes(filterBy)) {
      const filteredLocations = locations.filter(({ figure_type }) => figure_type === filterBy);
      return { locations: filteredLocations, isLoading, isFetching };
    }

    if (groupBy === GroupByOptions.TYPE) {
      // @ts-expect-error - todo - fix type inference for groupByFn
      const groupedLocations = groupByFn(locations, ({ type }) => type);
      return { locations: groupedLocations, isLoading, isFetching };
    }

    if (groupBy === GroupByOptions.FIGURE) {
      // @ts-expect-error - todo - fix type inference for groupByFn
      const groupedLocations = groupByFn(locations, ({ figure_type }) => figure_type);
      return { locations: groupedLocations, isLoading, isFetching };
    }

    if (groupBy === GroupByOptions.FIGURE_AND_TYPE) {
      // First: group by figure type (area, line, point)
      // @ts-expect-error - todo - fix type inference for groupByFn
      const groupedByFigure = groupByFn(locations, ({ figure_type }) => figure_type);

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
  }

  return {
    locations,
    isLoading,
    isFetching,
  };
}

export default useExternalLocations;
