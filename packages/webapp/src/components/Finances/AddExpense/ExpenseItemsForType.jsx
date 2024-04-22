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
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { AddLink, Main } from '../../Typography';
import ExpenseItemInputs from './ExpenseItemInputs';
import { getInputErrors } from '../../Form/Input';
import { DATE, NOTE, VALUE } from './constants';
import { getLocalDateInYYYYDDMM } from '../../../util/date';
import { selectedExpenseSelector } from '../../../containers/Finances/selectors';
import { setSelectedExpenseTypes } from '../../../containers/Finances/actions';
import styles from './styles.module.scss';
import { STEPS } from '../../AddExpenseForm';

export default function ExpenseItemsForType({ type }) {
  const { t } = useTranslation();
  const { control, getValues, register, errors, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${STEPS.EXPENSE_DETAIL}.${type.id}`,
  });

  // Initial item
  useEffect(() => {
    if (fields.length === 0) {
      append({ [DATE]: getLocalDateInYYYYDDMM(), [NOTE]: '', [VALUE]: null });
    }
  }, []);

  // Unselect the type when all items are removed, select the type when the first item is added.
  // If the user removes items for the type, it will be unselected in the previous page when going back.
  const handleSelectedExpenseTypes = (operationType) => {
    const itemsLength = getValues(`${STEPS.EXPENSE_DETAIL}.${type.id}`).length;
    const selectedTypes = getValues(STEPS.EXPENSE_TYPES);
    const allItemsRemoved = itemsLength === 0;
    const firstItemAdded = operationType === 'add' && itemsLength === 1;

    if (allItemsRemoved) {
      setValue(
        STEPS.EXPENSE_TYPES,
        selectedTypes.filter((id) => id !== type.id),
      );
    } else if (firstItemAdded) {
      setValue(STEPS.EXPENSE_TYPES, [...new Set([...selectedTypes, type.id])]);
    }
  };

  return (
    <div className={styles.expenseItemsForType}>
      <Main className={styles.type}>{type.name}</Main>
      {fields && fields.length ? (
        <div className={styles.box}>
          {fields.map((field, index) => {
            return (
              <ExpenseItemInputs
                key={field.id}
                onRemove={() => {
                  remove(index);
                  handleSelectedExpenseTypes('remove');
                }}
                register={(fieldName, options) =>
                  register(`${STEPS.EXPENSE_DETAIL}.${type.id}.${index}.${fieldName}`, options)
                }
                getErrors={(fieldName) =>
                  getInputErrors(errors, `${STEPS.EXPENSE_DETAIL}.${type.id}.${index}.${fieldName}`)
                }
              />
            );
          })}
        </div>
      ) : null}
      <AddLink
        onClick={() => {
          append({ [DATE]: getLocalDateInYYYYDDMM(), [NOTE]: '', [VALUE]: null });
          handleSelectedExpenseTypes('add');
        }}
      >
        {t('common:ADD_ANOTHER_ITEM')}
      </AddLink>
    </div>
  );
}

ExpenseItemsForType.propTypes = {
  type: PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }),
  register: PropTypes.func,
  control: PropTypes.any,
  getValues: PropTypes.func,
  errors: PropTypes.object,
};
