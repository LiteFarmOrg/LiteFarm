/*
 *  Copyright 2023 LiteFarm.org
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

import PureManagementPlanTile from '../../CropTile/ManagementPlanTile';
import { CROP_VARIETY_ID } from './constants';
import SaleLineItem from './SaleLineItem';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';

function CropSaleItem({
  option,
  system,
  currency,
  reactHookFormFunctions,
  fieldPrefix,
  disabledInput,
}) {
  const { management_plan_id, firstTaskDate, status } = option.data;
  const { register } = reactHookFormFunctions;

  register(`${fieldPrefix}.${option.value}.${CROP_VARIETY_ID}`, {
    required: true,
    value: option.value,
  });

  return (
    <div className={styles.saleItemContainer}>
      <PureManagementPlanTile
        key={management_plan_id}
        managementPlan={option.data}
        date={firstTaskDate}
        status={status}
      />
      <div className={styles.saleItemInputGroup}>
        <SaleLineItem
          fieldPrefix={fieldPrefix}
          entityId={option.value}
          system={system}
          currency={currency}
          reactHookFormFunctions={reactHookFormFunctions}
          disabledInput={disabledInput}
        />
      </div>
    </div>
  );
}

CropSaleItem.propTypes = {
  option: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
  }).isRequired,
  system: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  reactHookFormFunctions: PropTypes.object.isRequired,
  fieldPrefix: PropTypes.string.isRequired,
  disabledInput: PropTypes.bool.isRequired,
};

export default CropSaleItem;
