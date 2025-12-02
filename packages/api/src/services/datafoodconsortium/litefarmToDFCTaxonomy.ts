/*
 *  Copyright 2025 LiteFarm.org
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

import { ISKOSConcept } from '@datafoodconsortium/connector';

/**
 * =================================================================================
 * LiteFarm → Data Food Consortium (DFC) Taxonomy Mapping
 * =================================================================================
 *
 * This file bridges LiteFarm's internal product type keys (used in forms, DB, etc.)
 * with the **nested structure** used in the DFC taxonomy connector.
 *
 * This mapping tells us: "ALCOHOLIC_BEVERAGE" → "DRINK.ALCOHOLIC_BEVERAGE"
 *
 * [LiteFarm key]: [DFC nested path (dot notation)]
 *
 */
export const liteFarmToDFCTaxonomy = {
  ALCOHOLIC_BEVERAGE: 'DRINK.ALCOHOLIC_BEVERAGE',
  BAKERY: 'BAKERY',
  DAIRY_PRODUCT: 'DAIRY_PRODUCT',
  EGG: 'MEAT_PRODUCT.EGG',
  FLOWER: 'INEDIBLE.FLOWER',
  FROZEN: 'FROZEN',
  FRUIT: 'FRUIT',
  MEAT_PRODUCT: 'MEAT_PRODUCT',
  PLANT: 'INEDIBLE.PLANT',
  VEGETABLE: 'VEGETABLE',
};

/**
 * Resolve a dotted path string into a nested value.
 */
export function getNestedValue(obj: ISKOSConcept, path: string): ISKOSConcept | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return path.split('.').reduce((acc: any, key) => acc?.[key], obj);
}
