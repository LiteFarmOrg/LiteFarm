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

import { useMemo } from 'react';
import { type Product } from './types';
import styles from './styles.module.scss';
import { Unit } from '../../Form/CompositionInputs/NumberInputWithSelect';

const useProductOptions = (products: Product[] = []) => {
  return useMemo(() => {
    const prefix = ['N', 'P', 'K'];

    return products.map(({ product_id, name, n, p, k, npk_unit }) => {
      let npk = '';
      if (n || p || k) {
        if (npk_unit === Unit.RATIO) {
          npk = [n, p, k].map((value) => value || 0).join(' : ');
        } else {
          npk = [n, p, k].map((value, index) => `${prefix[index]}: ${value || 0}%`).join(', ');
        }
      }

      return {
        value: product_id,
        label: (
          <span className={styles.productOption}>
            <span key="name">{name}</span>
            <span key="npk">{npk}</span>
          </span>
        ),
      };
    });
  }, [products]);
};

export default useProductOptions;
