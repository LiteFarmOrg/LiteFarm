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

import { MutableRefObject } from 'react';
import { Location, UserFarm } from '../../types';
import PureMapHeader from '../Map/Header';
import LocationPicker from './SingleLocationPicker';
import styles from './styles.module.scss';

type LocationViewerProps = {
  locations: Location[];
  userFarm: UserFarm;
  maxZoomRef: MutableRefObject<undefined>;
  getMaxZoom: (maps: any, map?: null) => Promise<void>;
  handleClose: () => void;
};

const LocationViewer = ({
  locations = [],
  userFarm,
  maxZoomRef,
  getMaxZoom,
  handleClose,
}: LocationViewerProps) => {
  const { grid_points, farm_name } = userFarm;
  return (
    <>
      <PureMapHeader farmName={farm_name} handleClose={handleClose} />
      {/* @ts-expect-error */}
      <LocationPicker
        onSelectLocation={() => {
          //  TODO: fix onSelectLocationRef in LocationPicker
        }}
        locations={locations}
        // Choose the active state as the way to view-only locations
        selectedLocationIds={locations.map((l) => l.location_id)}
        farmCenterCoordinate={grid_points}
        maxZoomRef={maxZoomRef}
        getMaxZoom={getMaxZoom}
        className={styles.removeBottomMargin}
      />
    </>
  );
};

export default LocationViewer;
