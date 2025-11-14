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

import { Farm, User } from '../src/models/types.js';

export interface HeadersParams {
  user_id: User['user_id'];
  farm_id: Farm['farm_id'];
}

/**
 * Removes specified keys from each item in an array type.
 *
 * @example
 * WithoutKeysInArray<FarmMarketProductCategory[], 'market_directory_info_id'>
 * // → Omit<FarmMarketProductCategory, 'market_directory_info_id'>[]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutKeysInArray<T extends any[], K extends keyof T[number]> = Omit<T[number], K>[];

// Returns types without specified property
export type WithoutId<T> = Omit<T, 'id'>;
export type WithoutFarmId<T> = Omit<T, 'farm_id'>;
