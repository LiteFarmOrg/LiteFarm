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
import { STEPS } from '../AddAnimals';
import type { Option } from '../../../components/Animals/AddAnimalsFormCard/AnimalSelect';
import type { Details as SexDetailsType } from '../../../components/Form/SexDetails/SexDetailsPopover';

export const ANIMAL_BASICS_FIELD_NAMES = {
  TYPE: 'type',
  BREED: 'breed',
  SEX_DETAILS: 'sexDetails',
  COUNT: 'count',
  CREATE_INDIVIDUAL_PROFILES: 'createIndividualProfiles',
  GROUP: 'group',
  BATCH: 'batch',
} as const;

export type AnimalBasicsFormFields = {
  [ANIMAL_BASICS_FIELD_NAMES.TYPE]?: Option;
  [ANIMAL_BASICS_FIELD_NAMES.BREED]?: Option;
  [ANIMAL_BASICS_FIELD_NAMES.SEX_DETAILS]: SexDetailsType;
  [ANIMAL_BASICS_FIELD_NAMES.COUNT]?: number;
  [ANIMAL_BASICS_FIELD_NAMES.CREATE_INDIVIDUAL_PROFILES]?: boolean;
  [ANIMAL_BASICS_FIELD_NAMES.GROUP]?: string;
  [ANIMAL_BASICS_FIELD_NAMES.BATCH]?: string;
};

export type AddAnimalsFormFields = {
  [STEPS.BASICS]: AnimalBasicsFormFields[];
  // TODO: add other form fields here
};
