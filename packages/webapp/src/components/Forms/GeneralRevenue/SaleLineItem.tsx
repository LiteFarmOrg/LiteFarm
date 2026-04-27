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

import { harvestAmounts } from '../../../util/convert-units/unit';
import { QUANTITY, QUANTITY_UNIT, SALE_VALUE } from './constants';
import Unit from '../../Form/Unit';
import Input, { getInputErrors } from '../../Form/Input';
import { useTranslation } from 'react-i18next';

interface SaleLineItemProps {
  formKey: string;
  entityId: string;
  system: string;
  currency: string;
  reactHookFormFunctions: Record<string, any>;
  disabledInput: boolean;
}

function SaleLineItem({
  formKey,
  entityId,
  system,
  currency,
  reactHookFormFunctions,
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
  } = reactHookFormFunctions;
  const saleValueName = `${formKey}.${entityId}.${SALE_VALUE}`;

  return (
    <>
      {/* @ts-expect-error Unit is a legacy JS component without complete type declarations */}
      <Unit
        label={t('common:QUANTITY')}
        register={register}
        name={`${formKey}.${entityId}.${QUANTITY}`}
        displayUnitName={`${formKey}.${entityId}.${QUANTITY_UNIT}`}
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
