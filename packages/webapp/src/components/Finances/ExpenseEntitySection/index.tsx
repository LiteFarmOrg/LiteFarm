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

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { MultiValue } from 'react-select';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import EntityAssociationToggle from '../../Form/EntityAssociationToggle';
import { CheckboxMultiSelect, SelectOption } from '../../Form/ReactSelect/CheckboxMultiSelect';
import NumberInput from '../../Form/NumberInput';
import { getInputErrors } from '../../Form/Input';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import { Error, Main } from '../../Typography';
import { EntityType } from '../../../containers/Finances/types';
import { roundToTwoDecimal } from '../../../util/convert-units/unit';
import { useCurrencySymbol } from '../../../containers/hooks/useCurrencySymbol';
import { EXPENSE_ANIMAL, EXPENSE_CROP_VARIETY, VALUE } from '../AddExpense/constants';
import { getNoOptionsMessage } from '../../../containers/Finances/util';
import styles from './styles.module.scss';

interface ExpenseEntitySectionProps {
  fieldNamePrefix: string;
  cropVarietyOptions: SelectOption[];
  animalOptions: SelectOption[];
  disabled?: boolean;
}

interface EntityAllocationInputProps {
  inputName: string;
  option: SelectOption;
  currency: string;
  disabled?: boolean;
}

type AllocationRecord = Record<string, { allocated_value?: number | null }>;

const sumAllocated = (allocations?: AllocationRecord) => {
  return Object.values(allocations ?? {}).reduce(
    (sum, item) => sum + (Number(item?.allocated_value) || 0),
    0,
  );
};

function EntityAllocationInput({
  inputName,
  option,
  currency,
  disabled,
}: EntityAllocationInputProps) {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <div className={styles.entityBlock}>
      <Main className={styles.entityName}>{option.label}</Main>
      <NumberInput
        currencySymbol={currency}
        name={inputName}
        control={control}
        disabled={disabled}
        label={t('common:AMOUNT')}
        rules={{ required: { value: true, message: t('common:REQUIRED') } }}
      />
    </div>
  );
}

function ExpenseEntitySection({
  fieldNamePrefix,
  cropVarietyOptions,
  animalOptions,
  disabled,
}: ExpenseEntitySectionProps) {
  const { t } = useTranslation();
  const currency = useCurrencySymbol();
  const { register, unregister, watch, setValue, formState } = useFormContext();

  const prefixField = (relative: string) =>
    fieldNamePrefix ? `${fieldNamePrefix}.${relative}` : relative;

  const cropFieldPath = prefixField(EXPENSE_CROP_VARIETY);
  const animalFieldPath = prefixField(EXPENSE_ANIMAL);

  const cropAllocations: AllocationRecord | undefined = watch(cropFieldPath);
  const animalAllocations: AllocationRecord | undefined = watch(animalFieldPath);
  const entityType: EntityType = cropAllocations ? 'crop' : animalAllocations ? 'animal' : null;
  const isCropEntity = entityType === 'crop';

  const activeAllocations = (isCropEntity ? cropAllocations : animalAllocations) || {};
  const activeOptions = isCropEntity ? cropVarietyOptions : animalOptions;
  const activeFieldPath = isCropEntity ? cropFieldPath : animalFieldPath;
  const validationFieldPath = `${activeFieldPath}_validation`;

  const totalValue = Number(watch(prefixField(VALUE))) || 0;
  const remaining = totalValue - sumAllocated(activeAllocations);
  const allocationError = getInputErrors(formState.errors, validationFieldPath);

  const selectedOptions = Object.keys(activeAllocations).map(
    (id) => activeOptions.find((option) => String(option.value) === id)!,
  );

  const handleToggle = (newValue: EntityType) => {
    if (newValue === null) {
      setValue(cropFieldPath, null, { shouldDirty: true });
      setValue(animalFieldPath, null, { shouldDirty: true });
    } else {
      setValue(newValue === 'crop' ? cropFieldPath : animalFieldPath, {});
      setValue(newValue === 'crop' ? animalFieldPath : cropFieldPath, null, { shouldDirty: true });
    }
  };

  const handleSelectionChange = (newValue: MultiValue<SelectOption>) => {
    const newIds = newValue.map(({ value }) => String(value));
    const removedIds = Object.keys(activeAllocations).filter((id) => !newIds.includes(id));
    const newAllocations: AllocationRecord = {};
    if (newIds?.length) {
      newIds.forEach((id) => {
        newAllocations[id] = activeAllocations[id]
          ? { ...activeAllocations[id] }
          : { allocated_value: null };
      });
    }
    setValue(activeFieldPath, newAllocations, { shouldDirty: true });
    unregister(removedIds.map((id) => `${activeFieldPath}.${id}`));
  };

  useEffect(() => {
    let value: boolean | string;
    if (!entityType) {
      value = true;
    } else if (!Object.keys(activeAllocations).length) {
      value = false;
    } else {
      value = remaining >= 0 || t('EXPENSE.ENTITY_SECTION.EXCEEDED_ERROR');
    }
    setValue(validationFieldPath, value, { shouldValidate: true });
  }, [entityType, Object.keys(activeAllocations).length, remaining]);

  return (
    <div className={styles.wrapper}>
      <EntityAssociationToggle
        label={t('EXPENSE.ENTITY_SECTION.ENTITY_ASSOCIATION_LABEL')}
        value={entityType}
        onChange={handleToggle}
        isDisabled={disabled}
      />
      <input
        hidden
        {...register(validationFieldPath, { shouldUnregister: true, validate: (value) => value })}
      />
      {entityType !== null && (
        <>
          <div className={styles.selectWrapper}>
            <InputBaseLabel
              label={
                isCropEntity
                  ? t('SALE.ADD_SALE.CROP_VARIETY')
                  : t('EXPENSE.ENTITY_SECTION.SELECT_ANIMALS')
              }
              optional={false}
            />
            <CheckboxMultiSelect
              options={activeOptions}
              value={selectedOptions}
              onChange={handleSelectionChange}
              isDisabled={disabled}
              noOptionsMessage={getNoOptionsMessage(entityType)}
            />
          </div>
          {Object.keys(activeAllocations).length > 0 && (
            <>
              {!disabled && (
                <div className={styles.allocationSummary}>
                  <span>{t('EXPENSE.ENTITY_SECTION.TOTAL_TO_ALLOCATE')}</span>
                  <Badge remaining={remaining} currency={currency} />
                </div>
              )}
              {Object.keys(activeAllocations).map((id) => (
                <EntityAllocationInput
                  key={id}
                  inputName={`${activeFieldPath}.${id}.allocated_value`}
                  option={activeOptions.find(({ value }) => id === value)!}
                  currency={currency}
                  disabled={disabled}
                />
              ))}
              {allocationError && <Error>{allocationError}</Error>}
            </>
          )}
        </>
      )}
    </div>
  );
}

const Badge = ({ remaining, currency }: { remaining: number; currency: string }) => {
  const color = remaining === 0 ? 'green' : remaining > 0 ? 'blue' : 'red';

  const formattedRemaining =
    remaining < 0
      ? `-${currency}${roundToTwoDecimal(Math.abs(remaining))}`
      : `${currency}${roundToTwoDecimal(remaining)}`;

  return <span className={clsx(styles.amountBadge, styles[color])}>{formattedRemaining}</span>;
};

export default ExpenseEntitySection;
