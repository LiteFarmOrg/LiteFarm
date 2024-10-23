/*
 *  Copyright 2024 LiteFarm.org
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

import { getLocalDateInYYYYDDMM } from '../../../util/date';
import type { Animal, AnimalBatch } from '../../../store/api/types';

export const generateFormDate = (date?: string | null) => {
  return date ? getLocalDateInYYYYDDMM(new Date(date)) : '';
  // Right now the new date validation logic will fail if null is maintained; may want to revisit/change that but for now an empty string will pass (and matches 'add' mode)
};

interface RequestBodyAnimal extends Animal {
  type_name?: string;
  breed_name?: string;
}

interface RequestBodyAnimalBatch extends AnimalBatch {
  type_name?: string;
  breed_name?: string;
}

interface FieldMappingDict {
  [key: string]: {
    fields: (keyof RequestBodyAnimal | keyof RequestBodyAnimalBatch)[];
    nullValue: [] | null | string;
  };
}

// Mapping dictionary of form fields to fields returned by formatAnimalDetailsToDBStructure and their corresponding null values
const fieldMappingDict: FieldMappingDict = {
  use: { fields: ['animal_use_relationships', 'animal_batch_use_relationships'], nullValue: [] },
  other_use: {
    fields: ['animal_use_relationships', 'animal_batch_use_relationships'],
    nullValue: '',
  },
  identifier_type: {
    fields: ['identifier_type_id'],
    nullValue: null,
  },
  identifier_color: { fields: ['identifier_color_id'], nullValue: null },
  type: {
    fields: [
      'custom_type_id',
      'default_type_id',
      'type_name',
      'custom_breed_id',
      'default_breed_id',
      'breed_name',
    ],
    nullValue: null,
  },
  breed: { fields: ['custom_breed_id', 'default_breed_id', 'breed_name'], nullValue: null },
  sex_details: { fields: ['sex_detail'], nullValue: [] }, // sex_details has count property that needs updating
};

const keysToAlwaysInclude: (keyof RequestBodyAnimal | keyof RequestBodyAnimalBatch)[] = [
  'custom_type_id',
  'default_type_id', // never omit type, even if not dirtied
  'identifier_type_id', // 'identifier_type_other' is dependent on this
];

// Convert dirtyFields to the field names returned by formatAnimalDetailsToDBStructure
export const getChangedFields = (
  dirtyFields: Partial<Record<keyof RequestBodyAnimal | keyof RequestBodyAnimalBatch, boolean>>,
): (keyof RequestBodyAnimal | keyof RequestBodyAnimalBatch)[] => {
  let changedFields: (keyof RequestBodyAnimal | keyof RequestBodyAnimalBatch)[] = [];

  Object.keys(dirtyFields).forEach((key) => {
    if (key in fieldMappingDict) {
      changedFields = [...changedFields, ...fieldMappingDict[key].fields];
    } else {
      changedFields.push(key as keyof RequestBodyAnimal | keyof RequestBodyAnimalBatch);
    }
  });

  changedFields = [...changedFields, ...keysToAlwaysInclude];

  return changedFields;
};

// Send appropriate null value for dirtied fields
// (Note that manually cleared string inputs will not need adjust as the empty string is already sent)
export const addNullsToClearedFields = (
  formattedObject: Partial<Animal | AnimalBatch>,
  dirtyFields: Partial<Record<keyof Animal | keyof AnimalBatch, boolean>>,
): Partial<Animal | AnimalBatch> => {
  const updatedObject = { ...formattedObject };

  // for each dirtied field
  Object.keys(dirtyFields).forEach((key) => {
    if (key in fieldMappingDict) {
      fieldMappingDict[key].fields.forEach((mappedKey) => {
        // if the (mapped) key has not been included, include it as a null value
        if (!(mappedKey in updatedObject)) {
          (updatedObject as any)[mappedKey] = fieldMappingDict[key].nullValue;
        }
      });
    } else {
      // if the key has not been included, include it as a null value
      if (!(key in updatedObject)) {
        (updatedObject as any)[key] = null;
      }
    }
  });

  return updatedObject;
};
