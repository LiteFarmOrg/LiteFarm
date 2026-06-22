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

import { Controller, useFormContext } from 'react-hook-form';
import { harvestAmounts, waterUsage } from '../../../util/convert-units/unit';
import {
  MEASURED_BY,
  MEASURED_BY_UNIT,
  MEASURED_BY_VOLUME,
  MEASURED_BY_WEIGHT,
  QUANTITY,
  QUANTITY_UNIT,
  SALE_VALUE,
} from './constants';
import Unit from '../../Form/Unit';
import Input, { getInputErrors, integerOnKeyDown } from '../../Form/Input';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

interface SaleLineItemProps {
  fieldPrefix: string;
  entityId: string;
  entityIdFieldKey: string;
  system: string;
  currency: string;
  disabledInput: boolean;
}

function SaleLineItem({
  fieldPrefix,
  entityId,
  entityIdFieldKey,
  system,
  currency,
  disabledInput,
}: SaleLineItemProps) {
  const { t } = useTranslation();
  const {
    control,
    register,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const quantityName = `${fieldPrefix}.${entityId}.${QUANTITY}`;
  const unitName = `${fieldPrefix}.${entityId}.${QUANTITY_UNIT}`;
  const measuredByName = `${fieldPrefix}.${entityId}.${MEASURED_BY}`;
  const saleValueName = `${fieldPrefix}.${entityId}.${SALE_VALUE}`;

  register(`${fieldPrefix}.${entityId}.${entityIdFieldKey}`, {
    required: true,
    value: entityId,
  });

  const measuredByOptions = [
    { value: MEASURED_BY_WEIGHT, label: t('common:WEIGHT') },
    { value: MEASURED_BY_VOLUME, label: t('common:VOLUME') },
    { value: MEASURED_BY_UNIT, label: t('common:UNIT') },
  ];

  const measuredBy = watch(measuredByName) ?? MEASURED_BY_WEIGHT;

  return (
    <>
      <div className={styles.measuredByRow}>
        <div className={styles.measuredByField}>
          <Controller
            control={control}
            name={measuredByName}
            defaultValue={MEASURED_BY_WEIGHT}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <ReactSelect
                label={t('SALE.ADD_SALE.MEASURED_BY')}
                options={measuredByOptions}
                value={measuredByOptions.find((option) => option.value === value)}
                onChange={(option) => {
                  // quantity is stored in the active measure's database unit (kg, l, or the
                  // raw count), so a value carried over from the previous measure would be
                  // misread. Clear the value and its unit when the measure changes.
                  setValue(quantityName, null);
                  setValue(unitName, undefined);
                  onChange((option as { value: string }).value);
                }}
                isDisabled={disabledInput}
              />
            )}
          />
        </div>
        <div className={styles.quantityField}>
          {measuredBy === MEASURED_BY_UNIT ? (
            <Input
              label={t('common:QUANTITY')}
              type="number"
              onKeyDown={integerOnKeyDown}
              hookFormRegister={register(quantityName, {
                required: true,
                valueAsNumber: true,
                min: { value: 1, message: t('common:REQUIRED') },
              })}
              errors={getInputErrors(errors, quantityName)}
              disabled={disabledInput}
            />
          ) : (
            /* @ts-expect-error Unit is an untyped JS component */
            <Unit
              key={measuredBy}
              label={t('common:QUANTITY')}
              register={register}
              name={quantityName}
              displayUnitName={unitName}
              unitType={measuredBy === MEASURED_BY_VOLUME ? waterUsage : harvestAmounts}
              system={system}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
              hookFromWatch={watch}
              control={control}
              required
              disabled={disabledInput}
            />
          )}
        </div>
      </div>
      <Input
        label={`${t('SALE.ADD_SALE.TABLE_HEADERS.TOTAL')} (${currency})`}
        type="number"
        hookFormRegister={register(saleValueName, {
          required: true,
          valueAsNumber: true,
          min: { value: 0, message: t('SALE.ADD_SALE.SALE_VALUE_ERROR') },
          max: { value: 999999999, message: t('SALE.ADD_SALE.SALE_VALUE_ERROR') },
        })}
        currency={currency}
        errors={getInputErrors(errors, saleValueName)}
        disabled={disabledInput}
      />
    </>
  );
}

export default SaleLineItem;
