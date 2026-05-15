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
import { MultiValue } from 'react-select';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import EntityAssociationToggle from '../../Form/EntityAssociationToggle';
import { CheckboxMultiSelect, SelectOption } from '../../Form/ReactSelect/CheckboxMultiSelect';
import Input, { getInputErrors } from '../../Form/Input';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import { Error, Main } from '../../Typography';
import { EntityType } from '../../../containers/Finances/types';
import { roundToTwoDecimal } from '../../../util/convert-units/unit';
import { useCurrencySymbol } from '../../../containers/hooks/useCurrencySymbol';
import { EXPENSE_ANIMAL, EXPENSE_CROP_VARIETY, VALUE } from '../AddExpense/constants';
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

const sumAllocated = (allocations?: { allocated_value: number | undefined }[]) => {
  return (allocations ?? []).reduce((sum, item) => sum + (Number(item.allocated_value) || 0), 0);
};

function EntityAllocationInput({
  inputName,
  option,
  currency,
  disabled,
}: EntityAllocationInputProps) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div key={option.value} className={styles.entityBlock}>
      <Main className={styles.entityName}>{option.label}</Main>
      <Input
        label={t('common:AMOUNT')}
        type="number"
        currency={currency}
        hookFormRegister={register(inputName, {
          required: true,
          valueAsNumber: true,
          min: { value: 0, message: '' },
        })}
        errors={getInputErrors(errors, inputName)}
        disabled={disabled}
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
  const { unregister, watch, setValue, trigger, control } = useFormContext();

  const prefixField = (relative: string) =>
    fieldNamePrefix ? `${fieldNamePrefix}.${relative}` : relative;

  const cropAllocations = watch(prefixField(EXPENSE_CROP_VARIETY));
  const animalAllocations = watch(prefixField(EXPENSE_ANIMAL));
  const entityType: EntityType =
    cropAllocations !== undefined ? 'crop' : animalAllocations !== undefined ? 'animal' : null;
  const isCropEntity = entityType === 'crop';

  const activeFieldName = isCropEntity ? EXPENSE_CROP_VARIETY : EXPENSE_ANIMAL;
  const activeAllocations: any[] | undefined = isCropEntity ? cropAllocations : animalAllocations;
  const activeOptions = isCropEntity ? cropVarietyOptions : animalOptions;
  const activeFieldPath = prefixField(activeFieldName);

  const selectedOptions = (activeAllocations ?? []).map(
    (item) => activeOptions.find((option) => String(option.value) === item.id)!,
  );

  const totalValue = Number(watch(prefixField(VALUE))) || 0;
  const remaining = totalValue - sumAllocated(activeAllocations);

  const handleToggle = (newValue: EntityType) => {
    if (newValue === null) {
      unregister([prefixField(EXPENSE_CROP_VARIETY), prefixField(EXPENSE_ANIMAL)]);
    } else {
      setValue(prefixField(newValue === 'crop' ? EXPENSE_CROP_VARIETY : EXPENSE_ANIMAL), []);
      unregister(prefixField(newValue === 'crop' ? EXPENSE_ANIMAL : EXPENSE_CROP_VARIETY));
    }
  };

  const handleSelectionChange = (newValue: MultiValue<SelectOption>) => {
    const newAllocations = newValue.map((option) => {
      const id = String(option.value);
      const existingAllocation = activeAllocations?.find((item) => item.id === id);
      return existingAllocation ?? { id, allocated_value: null };
    });
    setValue(activeFieldPath, newAllocations);
    // trigger(activeFieldPath);
  };

  return (
    <div className={styles.wrapper}>
      <EntityAssociationToggle
        label={t('EXPENSE.ENTITY_SECTION.ENTITY_ASSOCIATION_LABEL')}
        value={entityType}
        onChange={handleToggle}
        isDisabled={disabled}
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
            />
          </div>

          {selectedOptions.length > 0 && (
            <>
              {!disabled && (
                <div className={styles.allocationSummary}>
                  <span>{t('EXPENSE.ENTITY_SECTION.TOTAL_TO_ALLOCATE')}</span>
                  <Badge remaining={remaining} currency={currency} />
                </div>
              )}
              <Controller
                key={activeFieldPath}
                name={activeFieldPath}
                control={control}
                rules={{
                  validate: (value) => {
                    const sum = sumAllocated(value);
                    return sum <= totalValue || t('EXPENSE.ENTITY_SECTION.EXCEEDED_ERROR');
                  },
                }}
                render={({ fieldState }) => (
                  <>
                    {selectedOptions.map((option, index) => (
                      <EntityAllocationInput
                        key={option.value}
                        inputName={`${activeFieldPath}.${index}.allocated_value`}
                        option={option}
                        currency={currency}
                        disabled={disabled}
                      />
                    ))}
                    {fieldState.error?.message && <Error>{fieldState.error?.message}</Error>}
                  </>
                )}
              />
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
