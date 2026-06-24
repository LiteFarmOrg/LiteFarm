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

import CropSaleInputs, { CropSale, getCropSaleDefaultValues } from './CropSaleInputs';
import AnimalSaleInputs, { AnimalSale, getAnimalSaleDefaultValues } from './AnimalSaleInputs';
import type { EntityType } from '../types';
import { System } from '../../../types';

type EntitySale = CropSale | AnimalSale;

interface EntitySaleInputsProps {
  sale?: EntitySale;
  disabledInput: boolean;
  entityType?: EntityType;
}

export const getEntityTypeDefaultValues = (
  sale: EntitySaleInputsProps['sale'],
  entityType: EntityType,
  system: System,
) => {
  if (entityType === 'crop') {
    return getCropSaleDefaultValues(sale as CropSale, system);
  }
  if (entityType === 'animal') {
    return getAnimalSaleDefaultValues(sale as AnimalSale, system);
  }
  return undefined;
};

export default function EntitySaleInputs({
  sale,
  disabledInput,
  entityType,
}: EntitySaleInputsProps) {
  if (entityType === 'crop') {
    return <CropSaleInputs sale={sale as CropSale} disabledInput={disabledInput} />;
  }
  if (entityType === 'animal') {
    return <AnimalSaleInputs sale={sale as AnimalSale} disabledInput={disabledInput} />;
  }
  return null;
}
