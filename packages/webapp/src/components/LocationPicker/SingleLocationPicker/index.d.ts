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

import { CSSProperties, FC, MutableRefObject } from 'react';

// types for SingleLocationPicker/index.jsx
export interface LocationPickerProps {
  onSelectLocation?: () => void;
  clearLocations?: () => void;
  selectedLocationIds: string[];
  isPinMode?: boolean;
  setPinCoordinate?: (coord: { lat: number; lng: number } | null) => void;
  pinCoordinate?: { lat: number; lng: number } | null;
  locations?: any[];
  farmCenterCoordinate?: { lat: number; lng: number };
  style?: CSSProperties;
  readOnlyPinCoordinates?: { lat: number; lng: number }[];
  maxZoomRef?: MutableRefObject<undefined>;
  getMaxZoom: (maps: any, map?: null) => Promise<void>;
  maxZoom?: number;
  disabled?: boolean;
  className?: string;
  showControls?: boolean;
  disableHover?: boolean;
}

declare const LocationPicker: FC<LocationPickerProps>;

export default LocationPicker;
