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

import { expect, describe, test } from 'vitest';
import { postTaskRequestHasNewProduct } from '../containers/Task/sagaUtils';

const createFakeProduct = (productId, name) => {
  return { product: { name }, product_id: productId };
};

describe('Task saga utils test', () => {
  describe('postTaskRequestHasNewProduct', () => {
    test('returns true when product has a name but no productId', () => {
      expect(
        postTaskRequestHasNewProduct(
          { cleaning_task: createFakeProduct(undefined, 'New product') },
          'CLEANING_TASK',
        ),
      ).toBe(true);

      expect(
        postTaskRequestHasNewProduct(
          { pest_control_task: createFakeProduct(undefined, 'New product') },
          'PEST_CONTROL_TASK',
        ),
      ).toBe(true);
    });

    test('returns false when product has a productId', () => {
      expect(
        postTaskRequestHasNewProduct({ cleaning_task: createFakeProduct('xxxx', 'Existing Product') }, 'CLEANING_TASK'),
      ).toBe(false);
    });

    test('returns false when the task has no product', () => {
      expect(postTaskRequestHasNewProduct({ irrigation_task: {} }, 'IRRIGATION_TASK')).toBe(false);
    });
  });
});
