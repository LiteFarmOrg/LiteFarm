/*
 *  Copyright 2026 LiteFarm.org
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

import { MAP_LOCATION_TYPE_BY_FIGURE } from './constants';
import useLocations from '../../hooks/location/useLocations';
import useExternalLocations from '../../hooks/location/useExternalLocations';
import { GroupByOptions } from '../../hooks/location/types';
import { FigureType } from '../../store/api/types';

const DEFAULT_FILTER_SETTINGS = MAP_LOCATION_TYPE_BY_FIGURE;

type UseAvailableFilterSettingsProps = {
  farm_id: string;
};

// From map filter setting slice -- map utils insteasd of hooks?
const useAvailableFilterSettings = ({ farm_id }: UseAvailableFilterSettingsProps) => {
  const { locations: internalLocations, isLoading: isLoadingInternalLocations } = useLocations({
    farm_id,
    groupBy: GroupByOptions.FIGURE_AND_TYPE,
  });
  const { locations: externalLocations, isLoading: isLoadingExternalLocations } =
    useExternalLocations({ groupBy: GroupByOptions.FIGURE_AND_TYPE });
  const isLocationsLoading = [isLoadingInternalLocations, isLoadingExternalLocations].some(Boolean);

  if (isLocationsLoading) {
    return DEFAULT_FILTER_SETTINGS;
  }

  const areaAssets = { ...internalLocations?.area, ...externalLocations?.area };
  const lineAssets = { ...internalLocations?.line, ...externalLocations?.line };
  const pointAssets = { ...internalLocations?.point, ...externalLocations?.point };

  return {
    area: DEFAULT_FILTER_SETTINGS[FigureType.AREA].filter((type) => areaAssets[type]?.length),
    line: DEFAULT_FILTER_SETTINGS[FigureType.LINE].filter((type) => lineAssets[type]?.length),
    point: DEFAULT_FILTER_SETTINGS[FigureType.POINT].filter((type) => pointAssets[type]?.length),
  };
};

export default useAvailableFilterSettings;
