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

import CropSaleInputs, { getCropSaleDefaultValues } from './CropSaleInputs';
import AnimalSaleInputs, { getAnimalSaleDefaultValues } from './AnimalSaleInputs';

interface RevenueType {
  revenue_type_id: number;
  entity_type?: 'crop' | 'animal' | 'none' | null;
}

interface RevenueTypeOption {
  value: number;
  label: string;
}

interface EntitySaleInputsProps {
  sale?: any;
  disabledInput: boolean;
  revenueTypes?: RevenueType[];
  selectedTypeOption?: RevenueTypeOption;
}

export const getEntitySaleDefaultValues = (
  sale: any,
  entityType: RevenueType['entity_type'] | undefined,
) => {
  if (entityType === 'crop') {
    return getCropSaleDefaultValues(sale);
  }
  if (entityType === 'animal') {
    return getAnimalSaleDefaultValues(sale);
  }
  return undefined;
};

export default function EntitySaleInputs({
  sale,
  disabledInput,
  revenueTypes,
  selectedTypeOption,
}: EntitySaleInputsProps) {
  const entityType = revenueTypes?.find(
    (rt) => rt.revenue_type_id === selectedTypeOption?.value,
  )?.entity_type;

  if (entityType === 'animal') {
    return <AnimalSaleInputs sale={sale} disabledInput={disabledInput} />;
  }
  return <CropSaleInputs sale={sale} disabledInput={disabledInput} />;
}
