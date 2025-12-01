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
 * =================================================================================
 * Deep Key & Value Utilities
 * =================================================================================
 *
 * These helpers let us resolve dot-notation strings like 'DRINK.ALCOHOLIC_BEVERAGE'
 * into real nested values with **full TypeScript autocomplete and type safety**.
 */

/**
 * Recursively builds a union of all possible dot-notation paths in an object.
 *
 * Example for PRODUCT_TYPES:
 *   "DRINK" | "DRINK.ALCOHOLIC_BEVERAGE" | "MEAT_PRODUCT" | "MEAT_PRODUCT.EGG" | ...
 */
export type DeepKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${DeepKeyOf<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

/**
 * Gets the value type at a given dotted path.
 */
type DeepValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends DeepKeyOf<T[K]>
      ? DeepValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

/**
 * Safely resolve a dotted path string into a nested value.
 */
export function getNestedValue<T extends object, P extends DeepKeyOf<T>>(
  obj: T,
  path: P,
): DeepValue<T, P> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = path.split('.').reduce((acc: any, key) => acc?.[key], obj);
  return value as DeepValue<T, P>;
}
