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

import { Semibold } from '../../Typography';
import SaleLineItem from './SaleLineItem';
import styles from './styles.module.scss';

interface AnimalSaleItemProps {
  animalName: string;
  entityId: string;
  system: string;
  currency: string;
  fieldPrefix: string;
  entityIdFieldKey: string;
  disabledInput: boolean;
}

function AnimalSaleItem({
  animalName,
  entityId,
  system,
  currency,
  fieldPrefix,
  entityIdFieldKey,
  disabledInput,
}: AnimalSaleItemProps) {
  return (
    <div className={styles.saleItemContainer}>
      <div className={styles.saleItemInputGroup}>
        <Semibold>{animalName}</Semibold>
        <SaleLineItem
          fieldPrefix={fieldPrefix}
          entityId={entityId}
          entityIdFieldKey={entityIdFieldKey}
          system={system}
          currency={currency}
          disabledInput={disabledInput}
        />
      </div>
    </div>
  );
}

export default AnimalSaleItem;
