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
import { DetailsFields } from '../AddAnimals/types';
import type { RequestBodyAnimal, RequestBodyAnimalBatch } from './types';

export const generateFormDate = (date?: string | null) => {
  return date ? getLocalDateInYYYYDDMM(new Date(date)) : '';
  // Right now the new date validation logic will fail if null is maintained; may want to revisit/change that but for now an empty string will pass (and matches 'add' mode)
};

interface FieldMappingDict {
  [key: string]: {
    fields: (keyof RequestBodyAnimal | keyof RequestBodyAnimalBatch)[];
    nullValue: [] | null | string;
  };
}

/**
 * Mapping dictionaries for field names and their corresponding null values.
 *
 * These dictionaries define the mappings between form fields and the fields returned by
 * `formatAnimalDetailsToDBStructure` and the null values to be used when
 * these fields are cleared.
 *
 **/

const baseFieldMappingDict: FieldMappingDict = {
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
      'custom_breed_id', // adding breed fields here as they by necessity change if type is changed, but won't return isDirty in the form state when cleared with resetField
      'default_breed_id',
      'breed_name',
    ],
    nullValue: null,
  },
  breed: { fields: ['custom_breed_id', 'default_breed_id', 'breed_name'], nullValue: null },
};

const animalFieldMappingDict: FieldMappingDict = {
  use: { fields: ['animal_use_relationships'], nullValue: [] },
};

const batchFieldMappingDict: FieldMappingDict = {
  use: { fields: ['animal_batch_use_relationships'], nullValue: [] },
};

// Function to combine base and specific dictionaries
const generateFieldMappingDict = (isBatch: boolean): FieldMappingDict => {
  return {
    ...baseFieldMappingDict,
    ...(isBatch ? batchFieldMappingDict : animalFieldMappingDict),
  };
};

/**
 * Adds null values to the cleared fields in the formatted object based on the dirty fields.
 *
 * This function takes a API-ready formatted animal/batch, a set of dirty fields, and a flag indicating whether the object is an animal or animal batch. It generates a field mapping dictionary based on the type (animal or batch), and then updates the formatted object by adding null values to any dirty fields that are missing from the formatted object
 *
 * @param formattedObject - The animal/batch with formatted data.
 * @param dirtyFields - The React Hook Form-tracked changed fields
 * @param {boolean} options.isBatch - Flag indicating whether the object is a batch.
 *
 * @returns {Partial<RequestBodyAnimal | RequestBodyAnimalBatch>} - The updated object with null values added to the cleared fields.
 *
 * @example
 * const formattedAnimal = {
    "default_type_id": 3,
    // other fields, not including animal_use_relationships as it has been cleared
    };
 * const dirtyFields = { use: true };
 * const animalWithNullFields = addNullsToClearedFields(formattedAnimal, dirtyFields, { isBatch: false });
 * 
 * @result animalWithNullFields = {
    "default_type_id": 3,
    "animal_use_relationships": [],
    };
    // other fields
 */
export const addNullsToClearedFields = (
  formattedObject: Partial<RequestBodyAnimal | RequestBodyAnimalBatch>,
  dirtyFields: Partial<Record<keyof DetailsFields, boolean>>,
  { isBatch }: { isBatch: boolean },
): Partial<RequestBodyAnimal | RequestBodyAnimalBatch> => {
  const updatedObject = { ...formattedObject };
  const fieldMappingDict = generateFieldMappingDict(isBatch);

  Object.keys(dirtyFields).forEach((key) => {
    if (key in fieldMappingDict) {
      fieldMappingDict[key].fields.forEach((mappedKey) => {
        if (!(mappedKey in updatedObject)) {
          (updatedObject as any)[mappedKey] = fieldMappingDict[key].nullValue;
        }
      });
    } else {
      if (
        !(key in updatedObject) ||
        updatedObject[key as keyof typeof updatedObject] === undefined
      ) {
        (updatedObject as any)[key] = null;
      }
    }
  });

  return updatedObject;
};
