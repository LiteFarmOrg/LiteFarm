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
      <PureMapHeader
        farmName={farm_name}
        showClose={handleClose}
        showVideo={undefined}
        isAdmin={undefined}
      />
      <LocationPicker
        onSelectLocation={() => {
          //  TODO: fix onSelectLocationRef in LocationPicker
        }}
        locations={locations}
        // Choose the active state as the way to view-only locations
        selectedLocationIds={locations.map((l) => l.id)}
        farmCenterCoordinate={grid_points}
        maxZoomRef={maxZoomRef}
        getMaxZoom={getMaxZoom}
        className={styles.removeBottomMargin}
        // Unused to quiet typescript
        style={undefined}
        maxZoom={undefined}
        isPinMode={undefined}
        setPinCoordinate={undefined}
        pinCoordinate={undefined}
        readOnlyPinCoordinates={undefined}
      />
    </>
  );
};

export default LocationViewer;
