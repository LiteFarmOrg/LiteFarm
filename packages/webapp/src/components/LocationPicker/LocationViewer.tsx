import { CSSProperties, MutableRefObject } from 'react';
import { Location, UserFarm } from '../../types';
import PureMapHeader from '../Map/Header';
import LocationPicker from './SingleLocationPicker';

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
        selectedLocationIds={[]}
        farmCenterCoordinate={grid_points}
        maxZoomRef={maxZoomRef}
        getMaxZoom={getMaxZoom}
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
