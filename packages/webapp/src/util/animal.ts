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

import { CustomAnimalType, DefaultAnimalType } from '../store/api/types';
import { ANIMAL_TYPE_ID_PREFIX } from '../containers/Animals/types';

export const generateUniqueAnimalTypeId = (type: DefaultAnimalType | CustomAnimalType): string => {
  return `${ANIMAL_TYPE_ID_PREFIX['key' in type ? 'DEFAULT' : 'CUSTOM']}_${type.id}`;
};
