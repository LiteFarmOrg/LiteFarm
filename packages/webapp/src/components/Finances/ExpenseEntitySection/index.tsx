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

import { useFieldArray, useFormContext } from 'react-hook-form';
import { MultiValue } from 'react-select';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import EntityAssociationToggle from '../../Form/EntityAssociationToggle';
import { CheckboxMultiSelect, SelectOption } from '../../Form/ReactSelect/CheckboxMultiSelect';
import NumberInput from '../../Form/NumberInput';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import { Error, Main } from '../../Typography';
import { EntityType } from '../../../containers/Finances/types';
import { roundToTwoDecimal } from '../../../util/convert-units/unit';
import { useCurrencySymbol } from '../../../containers/hooks/useCurrencySymbol';
import { ALLOCATIONS, ENTITY_TYPE, VALUE } from '../AddExpense/constants';
import { getNoOptionsMessage } from '../../../containers/Finances/util';
import styles from './styles.module.scss';

interface EntityAllocationInputProps {
  inputName: string;
  label: string;
  currency: string;
  disabled?: boolean;
}

interface ExpenseEntitySectionProps {
  fieldNamePrefix?: string;
  cropVarietyOptions: SelectOption[];
  animalOptions: SelectOption[];
  disabled?: boolean;
}

interface AllocationRecord {
  id: string;
  allocated_value?: number | null;
}

const sumAllocated = (allocations: AllocationRecord[] = []) => {
  return allocations.reduce((sum, item) => sum + (Number(item.allocated_value) || 0), 0);
};

function EntityAllocationInput({
  inputName,
  label,
  currency,
  disabled,
}: EntityAllocationInputProps) {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <div className={styles.entityBlock}>
      <Main className={styles.entityName}>{label}</Main>
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
  const { watch, getValues, setValue } = useFormContext();

  const prefixField = (fieldName: string) =>
    fieldNamePrefix ? `${fieldNamePrefix}.${fieldName}` : fieldName;

  const allocationsFieldPath = prefixField(ALLOCATIONS);
  const entityTypePath = prefixField(ENTITY_TYPE);
  const valuePath = prefixField(VALUE);

  // fields is used for rendering (stable keys); allocations reflects live form values
  const {
    fields,
    append: appendAssociation,
    remove: removeAssociations,
  } = useFieldArray({
    keyName: 'fieldKey',
    name: allocationsFieldPath,
    rules: {
      validate: (value) => {
        if (!getValues(entityTypePath)) {
          return true;
        }
        const sum = sumAllocated(value as AllocationRecord[]);
        return value.length > 0 && getValues(valuePath) >= sum;
      },
    },
  });

  const allocations: AllocationRecord[] = watch(allocationsFieldPath) || [];
  const totalValue = Number(watch(valuePath)) || 0;
  const entityType = watch(entityTypePath) || null;

  const isCropEntity = entityType === 'crop';
  const activeOptions = isCropEntity ? cropVarietyOptions : animalOptions;
  const remaining = totalValue - sumAllocated(allocations);

  const selectedOptions = allocations.map(({ id }) => {
    return activeOptions.find((option) => String(option.value) === id) ?? { label: id, value: id };
  });

  const handleToggle = (newValue: EntityType) => {
    setValue(entityTypePath, newValue);
    removeAssociations();
  };

  const handleSelectionChange = (newValue: MultiValue<SelectOption>) => {
    if (!newValue?.length) {
      removeAssociations();
      return;
    }
    const oldIds = selectedOptions.map(({ value }) => String(value));
    const newIds = newValue.map(({ value }) => String(value));
    const removedIndices = oldIds.flatMap((id, index) => (newIds.includes(id) ? [] : index));
    removeAssociations(removedIndices);
    newIds.forEach((id) => {
      if (!oldIds.includes(id)) {
        // Use empty string instead of null to prevent NumberInput from falling back to stale defaultValue
        appendAssociation({ id, allocated_value: '' });
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      <EntityAssociationToggle
        label={t('EXPENSE.ENTITY_SECTION.ENTITY_ASSOCIATION_LABEL')}
        value={entityType}
        onChange={handleToggle}
        isDisabled={disabled}
      />
      {entityType && (
        <>
          <div className={styles.selectWrapper}>
            <InputBaseLabel
              label={
                isCropEntity
                  ? t('SALE.ADD_SALE.CROP_VARIETY')
                  : t('EXPENSE.ENTITY_SECTION.SELECT_ANIMALS')
              }
            />
            <CheckboxMultiSelect
              options={activeOptions}
              value={selectedOptions}
              onChange={handleSelectionChange}
              isDisabled={disabled}
              noOptionsMessage={getNoOptionsMessage(entityType)}
            />
          </div>
          {!!fields.length && (
            <>
              {!disabled && (
                <div className={styles.allocationSummary}>
                  <span>{t('EXPENSE.ENTITY_SECTION.TOTAL_TO_ALLOCATE')}</span>
                  <Badge remaining={remaining} currency={currency} />
                </div>
              )}
              {fields.map((item, index) => (
                <EntityAllocationInput
                  key={item.fieldKey}
                  inputName={`${allocationsFieldPath}.${index}.allocated_value`}
                  label={selectedOptions[index]?.label}
                  currency={currency}
                  disabled={disabled}
                />
              ))}
              {remaining < 0 && <Error>{t('EXPENSE.ENTITY_SECTION.EXCEEDED_ERROR')}</Error>}
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
