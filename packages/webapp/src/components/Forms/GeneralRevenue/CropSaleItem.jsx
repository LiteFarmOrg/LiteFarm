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
import { harvestAmounts } from '../../../util/convert-units/unit';
import {
  CROP_VARIETY_SALE,
  CROP_VARIETY_ID,
  SALE_VALUE,
  QUANTITY,
  QUANTITY_UNIT,
} from './constants';
import Unit from '../../Form/Unit';
import Input, { getInputErrors } from '../../Form/Input';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';

function CropSaleItem({
  managementPlan,
  system,
  currency,
  reactHookFormFunctions,
  cropVarietyId,
  disabledInput,
}) {
  const { t } = useTranslation();
  const { management_plan_id, firstTaskDate, status } = managementPlan;
  const {
    control,
    register,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = reactHookFormFunctions;
  const saleValueRegisterName = `${CROP_VARIETY_SALE}.${cropVarietyId}.${SALE_VALUE}`;
  const cropVarietyIdRegisterName = `${CROP_VARIETY_SALE}.${cropVarietyId}.${CROP_VARIETY_ID}`;

  register(cropVarietyIdRegisterName, {
    required: true,
    value: cropVarietyId,
  });

  return (
    <div className={styles.saleItemContainer}>
      <PureManagementPlanTile
        key={management_plan_id}
        managementPlan={managementPlan}
        date={firstTaskDate}
        status={status}
      />
      <div className={styles.saleItemInputGroup}>
        <Unit
          label={t('common:QUANTITY')}
          register={register}
          name={`${CROP_VARIETY_SALE}.${cropVarietyId}.${QUANTITY}`}
          displayUnitName={`${CROP_VARIETY_SALE}.${cropVarietyId}.${QUANTITY_UNIT}`}
          unitType={harvestAmounts}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={disabledInput}
        />
        <Input
          label={`${t('SALE.ADD_SALE.TABLE_HEADERS.TOTAL')} (${currency})`}
          type="number"
          hookFormRegister={register(saleValueRegisterName, {
            required: true,
            valueAsNumber: true,
            min: { value: 0, message: t('SALE.ADD_SALE.SALE_VALUE_ERROR') },
            max: { value: 999999999, message: t('SALE.ADD_SALE.SALE_VALUE_ERROR') },
          })}
          currency={currency}
          errors={getInputErrors(errors, saleValueRegisterName)}
          disabled={disabledInput}
        />
      </div>
    </div>
  );
}

CropSaleItem.propTypes = {
  managementPlan: PropTypes.object.isRequired,
  system: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  reactHookFormFunctions: PropTypes.object.isRequired,
  cropVarietyId: PropTypes.string.isRequired,
  disabledInput: PropTypes.bool.isRequired,
};

export default CropSaleItem;
