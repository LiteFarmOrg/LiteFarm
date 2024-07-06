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

import { ElementalUnit } from '../../../../components/Task/AddSoilAmendmentProducts/types';

export const products = [
  {
    product_id: 1,
    name: 'Nutripost',
    product_translation_key: null,
    supplier: 'Nutriworld',
    type: 'soil_amendment_task',
    farm_id: 'xxx',
    on_permitted_substances_list: null,
    n: 32,
    p: 5,
    k: 3,
    npk_unit: ElementalUnit.PERCENT,
  },
  {
    product_id: 2,
    name: 'Compost',
    product_translation_key: null,
    supplier: 'Organic earth',
    type: 'soil_amendment_task',
    farm_id: 'xxx',
    on_permitted_substances_list: 'YES' as const,
    n: 2,
    p: 0,
    k: 3.3,
    npk_unit: ElementalUnit.RATIO,
  },
  {
    product_id: 3,
    name: 'Product 1',
    product_translation_key: null,
    supplier: 'Supplier',
    type: 'soil_amendment_task',
    farm_id: 'xxx',
    on_permitted_substances_list: 'YES' as const,
    n: undefined,
    p: undefined,
    k: undefined,
    npk_unit: null,
  },
  {
    product_id: 4,
    name: 'Product 2',
    product_translation_key: null,
    supplier: 'Supplier',
    type: 'soil_amendment_task',
    farm_id: 'xxx',
    on_permitted_substances_list: 'NO' as const,
    n: 0,
    p: 0,
    k: 1,
    npk_unit: ElementalUnit.PERCENT,
  },
  {
    product_id: 5,
    name: 'Product 3',
    product_translation_key: null,
    supplier: 'Supplier',
    type: 'soil_amendment_task',
    farm_id: 'xxx',
    on_permitted_substances_list: 'NOT_SURE' as const,
    n: 99,
    p: undefined,
    k: 1,
    npk_unit: ElementalUnit.PERCENT,
  },
];
