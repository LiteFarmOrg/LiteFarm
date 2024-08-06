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
import { FormFields as AnimalBasicsFormFields } from '../../../components/Animals/AddAnimalsFormCard/AddAnimalsFormCard';

export const ANIMAL_BASICS_FIELD_ARRAY_NAME = 'animals'; // check what's desired here

export type AddAnimalsFormFields = {
  [ANIMAL_BASICS_FIELD_ARRAY_NAME]: AnimalBasicsFormFields[];
  // TODO: add other form fields here
};
