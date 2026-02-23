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

import { MultiValue, SingleValue } from 'react-select';
import Select from '../../Form/ReactSelect';
import { Location } from '../../../types';
import {
  CheckboxMultiSelect,
  SelectOption,
} from '../../Form/ReactSelect/CheckboxMultiSelect/index';

interface OfflineLocationPickerProps {
  locations: Location[];
  isMulti?: boolean;
  onSelectLocation: (location_id: string) => void;
  clearLocations: () => void;
  selectedLocationIds: string[];
  disabled?: boolean;
}

interface LocationOption {
  label: string;
  value: string; // location_id
}

// Offline-compatible version of the Google Maps location picker; presents farm locations as a searchable dropdown
const OfflineLocationPicker = ({
  locations,
  isMulti = true,
  onSelectLocation,
  clearLocations,
  selectedLocationIds,
  disabled = false,
}: OfflineLocationPickerProps) => {
  const options = locations.map(({ location_id, name }) => ({
    value: location_id,
    label: name,
  }));

  const selectedOptions = options.filter(({ value }) => selectedLocationIds.includes(value));

  if (isMulti) {
    // This handler adapts React Select's full selection state to the same single location_id that onSelectLocation expects
    const handleChange = (newValue: MultiValue<SelectOption>) => {
      if (newValue.length === 0) {
        clearLocations();
        return;
      }
      const newIds = new Set(newValue.map((option) => option.value));
      const added = newValue.find(
        (option) => !selectedLocationIds.includes(option.value as string),
      );
      const removed = selectedLocationIds.find((id) => !newIds.has(id));

      // Assumes only one location is added or removed per change event (other than when clearing), which is correct for the <CheckboxMultiSelect />
      if (added) {
        onSelectLocation(added.value as string);
      } else if (removed) {
        onSelectLocation(removed);
      }
    };

    return (
      <CheckboxMultiSelect
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        isDisabled={disabled}
      />

      // Wait, maybe we just want this???!
      // <Select
      //   isMulti
      //   options={options}
      //   value={selectedOptions}
      //   isDisabled={disabled}
      //   onChange={handleChange}
      //   isClearable
      //   components={{ IndicatorSeparator: null }}
      // />
    );
  }

  const handleChange = (newValue: SingleValue<LocationOption>) => {
    if (!newValue) {
      clearLocations();
    } else {
      onSelectLocation(newValue.value);
    }
  };

  return (
    <Select
      options={options}
      value={selectedOptions[0] ?? null}
      isDisabled={disabled}
      isClearable
      onChange={handleChange}
      components={{ IndicatorSeparator: null }}
    />
  );
};

export default OfflineLocationPicker;
