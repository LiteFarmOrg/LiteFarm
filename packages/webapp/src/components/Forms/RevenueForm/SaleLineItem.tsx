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

import { useFormContext } from 'react-hook-form';
import { harvestAmounts } from '../../../util/convert-units/unit';
import { QUANTITY, QUANTITY_UNIT, SALE_VALUE } from './constants';
import Unit from '../../Form/Unit';
import Input, { getInputErrors } from '../../Form/Input';
import { useTranslation } from 'react-i18next';

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
  const saleValueName = `${fieldPrefix}.${entityId}.${SALE_VALUE}`;

  register(`${fieldPrefix}.${entityId}.${entityIdFieldKey}`, {
    required: true,
    value: entityId,
  });

  return (
    <>
      {/* @ts-expect-error */}
      <Unit
        label={t('common:QUANTITY')}
        register={register}
        name={`${fieldPrefix}.${entityId}.${QUANTITY}`}
        displayUnitName={`${fieldPrefix}.${entityId}.${QUANTITY_UNIT}`}
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
