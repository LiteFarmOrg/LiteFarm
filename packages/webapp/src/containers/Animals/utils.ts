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
import i18n from '../../locales/i18n';
import { Animal, AnimalBatch } from '../../store/api/types';

const { t } = i18n;

export const chooseIdentification = (animalOrBatch: Animal | AnimalBatch) => {
  if ('identifier' in animalOrBatch && animalOrBatch.identifier) {
    if (animalOrBatch.name && animalOrBatch.identifier) {
      return `${animalOrBatch.name} | ${animalOrBatch.identifier}`;
    } else if (!animalOrBatch.name && animalOrBatch.identifier) {
      return animalOrBatch.identifier;
    }
  }
  if (animalOrBatch.name) {
    return animalOrBatch.name;
  }
  return `${t('ANIMAL.ANIMAL_ID')}${animalOrBatch.internal_identifier}`;
};
