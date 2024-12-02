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

import { Animal, AnimalBatch, CustomAnimalBreed, CustomAnimalType } from '../../store/api/types';
import { OrganicStatus } from '../../types';

export const mockDefaultAnimalTypes = [
  { id: 1, key: 'CATTLE' },
  { id: 2, key: 'PIGS' },
  { id: 3, key: 'CHICKEN' },
];

export const mockDefaultAnimalBreeds = [
  { id: 1, default_type_id: 1, key: 'ANGUS' },
  { id: 2, default_type_id: 1, key: 'HEREFORD' },
  { id: 3, default_type_id: 1, key: 'CHAROLAIS' },
  { id: 4, default_type_id: 2, key: 'YORKSHIRE_LARGE_WHITE' },
  { id: 5, default_type_id: 2, key: 'LANDRACE' },
  { id: 6, default_type_id: 2, key: 'DUROC' },
  { id: 7, default_type_id: 3, key: 'CORNISH_CROSS' },
  { id: 8, default_type_id: 3, key: 'ROSS_308' },
  { id: 9, default_type_id: 3, key: 'COBB_500' },
  { id: 10, default_type_id: 3, key: 'LEGHORN' },
  { id: 11, default_type_id: 3, key: 'RHODE_ISLAND_RED' },
  { id: 12, default_type_id: 3, key: 'PLYMOUTH_ROCK' },
];

export const mockCustomAnimalTypes: CustomAnimalType[] = [
  { id: 1, type: 'Eastern long-beaked echidna', farm_id: 'xxx' },
];

export const mockCustomAnimalBreeds: CustomAnimalBreed[] = [
  { id: 1, custom_type_id: 1, breed: 'Zaglossus bartoni diamondi', farm_id: 'xxx' },
];

export const mockAnimal1: Animal = {
  id: 1,
  farm_id: 'xxx',
  default_type_id: 2,
  custom_type_id: null,
  default_breed_id: 4,
  custom_breed_id: null,
  sex_id: 1,
  name: 'Donald',
  birth_date: '2024-01-30T08:00:00.000Z',
  identifier: 'PIG436',
  identifier_color_id: 1,
  origin_id: 2,
  dam: 'Peppa - PIG842',
  sire: 'Bacon - PIG874',
  brought_in_date: '2024-01-30T08:00:00.000Z',
  weaning_date: '2024-02-30T08:00:00.000Z',
  notes:
    'Me non paenitet nullum festiviorem excogitasse ad hoc. Morbi fringilla convallis sapien, id pulvinar odio volutpat. Petierunt uti sibi concilium totius Galliae in diem certam indicere. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Plura mihi bona sunt, inclinet, amari petere vellent.',
  photo_url:
    'https://static.wixstatic.com/media/ca45dd_ea30e94b115447308dc0ba32442e8b63~mv2.jpg/v1/fill/w_265,h_265,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/become%20a%20contributor-05.jpg',
  animal_removal_reason_id: null,
  removal_explanation: null,
  removal_date: null,
  identifier_type_id: 2,
  identifier_type_other: null,
  organic_status: OrganicStatus.ORGANIC,
  supplier: 'supplier name',
  price: 1000,
  internal_identifier: 12,
};

export const mockAnimal2: Animal = {
  ...mockAnimal1,
  id: 2,
  name: 'The Southeast New Guinea Highlands Spiny-Bodied Egg-Laying Monotreme Echidna',
  default_type_id: null,
  default_breed_id: null,
  custom_type_id: 1,
  custom_breed_id: 1,
};

export const mockBatch1: AnimalBatch = {
  id: 1,
  farm_id: 'xxx',
  default_type_id: 3,
  custom_type_id: null,
  default_breed_id: 12,
  custom_breed_id: null,
  name: 'Chick’n’Roll',
  birth_date: '2023-06-01T08:00:00.000Z',
  origin_id: 1,
  dam: null,
  sire: null,
  brought_in_date: null,
  notes:
    'Me non paenitet nullum festiviorem excogitasse ad hoc. Morbi fringilla convallis sapien, id pulvinar odio volutpat. Petierunt uti sibi concilium totius Galliae in diem certam indicere. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Plura mihi bona sunt, inclinet, amari petere vellent.',
  photo_url:
    'https://static.wixstatic.com/media/ca45dd_ea30e94b115447308dc0ba32442e8b63~mv2.jpg/v1/fill/w_265,h_265,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/become%20a%20contributor-05.jpg',
  animal_removal_reason_id: null,
  removal_explanation: null,
  removal_date: null,
  organic_status: OrganicStatus.TRANSITIONAL,
  supplier: 'Supplier',
  price: 555550,
  internal_identifier: 12,
  count: 1238,
  sex_detail: [
    { sex_id: 1, count: 30 },
    { sex_id: 2, count: 40 },
  ],
};
