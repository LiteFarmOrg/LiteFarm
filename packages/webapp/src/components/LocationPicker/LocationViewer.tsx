import { CSSProperties, MutableRefObject } from 'react';
import { Location } from '../../types';
import LocationPicker from './SingleLocationPicker';

type LocationViewerProps = {
  locations: Location[];
  farmCenterCoordinate: { lat: number; lng: number };
  maxZoomRef: MutableRefObject<undefined>;
  getMaxZoom: (maps: any, map?: null) => Promise<void>;
};

const LocationViewer = ({
  locations = [],
  farmCenterCoordinate,
  maxZoomRef,
  getMaxZoom,
}: LocationViewerProps) => {
  return (
    <LocationPicker
      onSelectLocation={() => {
        //  TODO: fix onSelectLocationRef in LocationPicker
      }}
      locations={locations}
      selectedLocationIds={[]}
      farmCenterCoordinate={farmCenterCoordinate}
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
  );
};

export default LocationViewer;
