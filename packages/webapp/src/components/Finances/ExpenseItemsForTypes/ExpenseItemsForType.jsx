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
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useFieldArray } from 'react-hook-form';
import { AddLink, Main } from '../../Typography';
import ExpenseItemInputs from './ExpenseItemInputs';
import { getInputErrors } from '../../Form/Input';
import styles from './styles.module.scss';

export default function ExpenseItemsForType({
  type,
  register,
  control,
  setValue,
  setExpenseDetail,
  errors,
}) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: type.id });

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
                  setExpenseDetail();
                }}
                register={(fieldName, options) =>
                  register(`${type.id}.${index}.${fieldName}`, options)
                }
                onChange={(e, fieldName) => {
                  setValue(`${type.id}.${index}.${fieldName}`, e.target.value);
                  setExpenseDetail();
                }}
                getErrors={(fieldName) =>
                  getInputErrors(errors, `${type.id}.${index}.${fieldName}`)
                }
              />
            );
          })}
        </div>
      ) : null}
      <AddLink onClick={append}>{t('common:ADD_ANOTHER_ITEM')}</AddLink>
    </div>
  );
}

ExpenseItemsForType.propTypes = {
  type: PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }),
  register: PropTypes.func,
  control: PropTypes.any,
  setValue: PropTypes.func,
  setExpenseDetail: PropTypes.func,
  errors: PropTypes.object,
};
