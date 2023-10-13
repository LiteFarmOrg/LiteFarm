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
import { CHOSEN_VARIETIES, CROP_VARIETY_ID, SALE_VALUE } from './constants';
import Unit from '../../Form/Unit';
import Input, { getInputErrors } from '../../Form/Input';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export default function CropSaleItem({
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
  const saleValueRegisterName = `${CHOSEN_VARIETIES}.${cropVarietyId}.${SALE_VALUE}`;
  const cropVarietyIdRegisterName = `${CHOSEN_VARIETIES}.${cropVarietyId}.${CROP_VARIETY_ID}`;

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
          label={t('SALE.ADD_SALE.TABLE_HEADERS.QUANTITY')}
          register={register}
          name={`${CHOSEN_VARIETIES}.${cropVarietyId}.quantity`}
          displayUnitName={`${CHOSEN_VARIETIES}.${cropVarietyId}.quantity_unit`}
          unitType={harvestAmounts}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          style={{ marginBottom: '40px' }}
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
          style={{ marginBottom: '40px' }}
          errors={getInputErrors(errors, saleValueRegisterName)}
          disabled={disabledInput}
        />
      </div>
    </div>
  );
}
