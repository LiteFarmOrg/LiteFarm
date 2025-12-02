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
 * DeepKeyOf<T>
 *
 * Goal: Turn any nested object into a union of all possible "dot paths" as string literals.
 *
 * Example:
 *   const obj = { a: { b: { c: 123 } }, d: 456 } as const;
 *   type Keys = DeepKeyOf<typeof obj>;
 *   // → "a" | "a.b" | "a.b.c" | "d"
 *
 * This lets us write:
 *   getNestedValue(obj, "a.b.c")  // fully type-safe, autocomplete works!
 */
export type DeepKeyOf<T> =
  // Step 1: If T is not an object (e.g. string, number, null), return never
  //         This stops recursion at leaf nodes
  T extends object
    ? {
        // Step 2: Map over every key K in T (keyof T gives us all keys)
        //         For each key, we produce a string (or union of strings)
        [K in keyof T]: //         (object keys in JS become strings anyway) // Step 3: K is always a string/symbol/number, but we only care about string keys
        K extends string
          ? T[K] extends object
            ? // Case A: The value at K is another object → we can go deeper
              //         So we return:
              //         1. Just this key: "USER"
              //         2. This key + all deep paths inside it: "USER.profile.name" etc.
              `${K}` | `${K}.${DeepKeyOf<T[K]>}`
            : // Case B: The value is a primitive (string, number, etc.)
              //         → This is a leaf → only return the current key
              `${K}`
          : never; // (K was symbol or number → ignore it)
      }[keyof T] // Step 4: This is the magic!
    : // We now have an object like:
      // { a: "a" | "a.b" | "a.b.c", d: "d", ... }
      // The [keyof T] at the end extracts ALL values from that object
      // and forms a union → "a" | "a.b" | "a.b.c" | "d"
      never; // T was not an object → no valid paths

/**
 * DeepValue<T, P>
 *
 * Given:
 *   T = the nested object (e.g. connector.PRODUCT_TYPES)
 *   P = a string path like "DRINK.ALCOHOLIC_BEVERAGE"
 *
 * Returns: the exact type of the value at that path
 */
type DeepValue<T, P extends string> =
  // Step 1: Does the path contain a dot? → "K.Rest"
  //         Example: "DRINK.ALCOHOLIC_BEVERAGE" → K = "DRINK", Rest = "ALCOHOLIC_BEVERAGE"
  P extends `${infer K}.${infer Rest}`
    ? // Step 2: Is the first part (K) actually a key on T?
      //         e.g. Does T have a property called "DRINK"?
      K extends keyof T
      ? // Step 3: Is the remaining path (Rest) valid inside T[K]?
        //         Use DeepKeyOf to check: is "ALCOHOLIC_BEVERAGE" a valid deep key inside T["DRINK"]?
        Rest extends DeepKeyOf<T[K]>
        ? // Step 4: RECURSE! Now resolve the value inside the nested object
          //         "What is the value type of T["DRINK"] at path "ALCOHOLIC_BEVERAGE"?"
          DeepValue<T[K], Rest>
        : // Invalid sub-path → impossible
          never
      : // First key doesn't exist → impossible
        never
    : // Step 5: No dot → this is a top-level key like "BAKERY"
      //         Just check: does T have this key?
      P extends keyof T
      ? // Yes → return the actual type of that property
        T[P]
      : // No → impossible path
        never;

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
