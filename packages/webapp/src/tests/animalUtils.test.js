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

import { expect, describe, test, vi } from 'vitest';
import {
  formatDBAnimalsToSummary,
  formatDBBatchesToSummary,
} from '../containers/Animals/AddAnimals/utils';

describe('animalUtils test', () => {
  vi.mock('../locales/i18n', () => {
    return {
      default: {
        t: vi.fn((key) => {
          return {
            'animal:SEX.MALE': 'Male',
            'animal:SEX.FEMALE': 'Female',
            'TYPE.CATTLE': 'Cattle',
            'TYPE.PIGS': 'Pigs',
            'TYPE.CHICKEN': 'Chicken',
            'BREED.ANGUS': 'Angus',
            'BREED.HEREFORD': 'Hereford',
            'BREED.DALMATIAN': 'Dalmatian',
          }[key];
        }),
      },
    };
  });

  const defaultTypeId = { CATTLE: 1, PIGS: 2, CHICKEN: 3 };
  const customTypeId = { DOG: 1, CAT: 2 };
  const defaultBreedId = { ANGUS: 1, HEREFORD: 2, LANDRACE: 3 };
  const customBreedId = { BEAGLE: 1 };
  const sexId = { MALE: 1, FEMALE: 2 };

  const config = {
    defaultTypes: [
      { id: defaultTypeId.CATTLE, key: 'CATTLE' },
      { id: defaultTypeId.PIGS, key: 'PIGS' },
      { id: defaultTypeId.CHICKEN, key: 'CHICKEN' },
    ],
    customTypes: [{ id: customTypeId.DOG, farm_id: 'xx', type: 'Dog' }],
    defaultBreeds: [
      { id: defaultBreedId.ANGUS, default_type_id: defaultTypeId.CATTLE, key: 'ANGUS' },
      { id: defaultBreedId.HEREFORD, default_type_id: defaultTypeId.CATTLE, key: 'HEREFORD' },
    ],
    customBreeds: [{ id: customBreedId.BEAGLE, custom_type_id: customTypeId.DOG, breed: 'Beagle' }],
    sexes: [
      { id: sexId.MALE, key: 'MALE' },
      { id: sexId.FEMALE, key: 'FEMALE' },
    ],
  };

  describe('formatDBAnimalsToSummary test', () => {
    const createTypeBreedSummary = (type, breed, maleCount, femaleCount) => ({
      type,
      breed,
      sexDetails: { Male: maleCount, Female: femaleCount },
      iconKey: type.toUpperCase(),
    });

    test('Should format one type correctly', () => {
      const animals = [
        { id: 1, default_type_id: defaultTypeId.CATTLE },
        { id: 2, default_type_id: defaultTypeId.CATTLE },
        { id: 3, default_type_id: defaultTypeId.CATTLE },
      ];
      const expectedResult = [createTypeBreedSummary('Cattle', null, 0, 0)];

      expect(formatDBAnimalsToSummary(animals, config)).toEqual(expectedResult);
    });

    test('Should format multiple types correctly', () => {
      const animals = [
        { id: 1, default_type_id: defaultTypeId.CATTLE },
        { id: 2, default_type_id: defaultTypeId.PIGS },
        { id: 3, default_type_id: defaultTypeId.PIGS },
        { id: 4, default_type_id: defaultTypeId.CHICKEN },
      ];
      const expectedResult = [
        createTypeBreedSummary('Cattle', null, 0, 0),
        createTypeBreedSummary('Pigs', null, 0, 0),
        createTypeBreedSummary('Chicken', null, 0, 0),
      ];

      expect(formatDBAnimalsToSummary(animals, config)).toEqual(expectedResult);
    });

    test('Should format breeds correctly when some animals have breeds and others do not', () => {
      const animals = [
        { id: 1, default_type_id: defaultTypeId.CATTLE, default_breed_id: defaultBreedId.ANGUS },
        { id: 2, default_type_id: defaultTypeId.CATTLE },
        { id: 3, default_type_id: defaultTypeId.CATTLE, default_breed_id: defaultBreedId.HEREFORD },
        { id: 4, default_type_id: defaultTypeId.CATTLE, default_breed_id: defaultBreedId.HEREFORD },
      ];
      const expectedResult = [
        createTypeBreedSummary('Cattle', 'Angus', 0, 0),
        createTypeBreedSummary('Cattle', null, 0, 0),
        createTypeBreedSummary('Cattle', 'Hereford', 0, 0),
      ];

      expect(formatDBAnimalsToSummary(animals, config)).toEqual(expectedResult);
    });

    test('Should format sexDetails correctly when some animals have sexId and others do not', () => {
      const animals = [
        { id: 1, default_type_id: defaultTypeId.CATTLE, sex_id: sexId.FEMALE },
        { id: 2, default_type_id: defaultTypeId.CATTLE, sex_id: sexId.MALE },
        { id: 3, default_type_id: defaultTypeId.CATTLE, sex_id: sexId.FEMALE },
        { id: 4, default_type_id: defaultTypeId.CATTLE },
      ];
      const expectedResult = [createTypeBreedSummary('Cattle', null, 1, 2)];

      expect(formatDBAnimalsToSummary(animals, config)).toEqual(expectedResult);
    });

    test('Should format sexDetails correctly while formatting different types and breeds', () => {
      const animals = [
        ...[1, 2, 3, 4].map((id) => ({
          id,
          default_type_id: defaultTypeId.CATTLE,
          default_breed_id: defaultBreedId.ANGUS,
          sex_id: sexId.FEMALE,
        })),
        ...[5, 6, 7].map((id) => ({
          id,
          default_type_id: defaultTypeId.CATTLE,
          default_breed_id: defaultBreedId.ANGUS,
          sex_id: sexId.MALE,
        })),
        ...[8, 9, 10].map((id) => ({
          id,
          default_type_id: defaultTypeId.CHICKEN,
          sex_id: sexId.MALE,
        })),
        ...[11, 12, 13].map((id) => ({
          id,
          default_type_id: defaultTypeId.CHICKEN,
          sex_id: sexId.FEMALE,
        })),
        ...[14, 15, 16, 17].map((id) => ({
          id,
          custom_type_id: customTypeId.DOG,
          sex_id: sexId.MALE,
        })),
      ];
      const expectedResult = [
        createTypeBreedSummary('Cattle', 'Angus', 3, 4),
        createTypeBreedSummary('Chicken', null, 3, 3),
        createTypeBreedSummary('Dog', null, 4, 0),
      ];

      expect(formatDBAnimalsToSummary(animals, config)).toEqual(expectedResult);
    });
  });

  describe('formatDBBatchesToSummary test', () => {
    test('Should calculate counts correctly while formatting different types and breeds', () => {
      const batches = [
        {
          id: 1,
          default_type_id: defaultTypeId.CATTLE,
          default_breed_id: defaultBreedId.ANGUS,
          count: 100,
        },
        {
          id: 2,
          default_type_id: defaultTypeId.CATTLE,
          default_breed_id: defaultBreedId.ANGUS,
          count: 150,
        },
        {
          id: 3,
          default_type_id: defaultTypeId.CHICKEN,
          count: 1238,
        },
        {
          id: 4,
          custom_type_id: customTypeId.DOG,
          count: 101,
        },
      ];
      const expectedResult = [
        { type: 'Cattle', breed: 'Angus', iconKey: 'CATTLE', count: 250 },
        { type: 'Chicken', breed: null, iconKey: 'CHICKEN', count: 1238 },
        { type: 'Dog', breed: null, iconKey: 'DOG', count: 101 },
      ];

      expect(formatDBBatchesToSummary(batches, config)).toEqual(expectedResult);
    });
  });
});
