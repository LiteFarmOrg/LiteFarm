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
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { AddLink, Main } from '../../Typography';
import ExpenseItemInputs from './ExpenseItemInputs';
import { DATE, NOTE, VALUE, EXPENSE_DETAIL } from './constants';
import { getLocalDateInYYYYDDMM } from '../../../util/date';
import styles from './styles.module.scss';

export default function ExpenseItemsForType({ type, cropVarietyOptions, animalOptions }) {
  const { t } = useTranslation();
  const { control, getValues } = useFormContext();

  const itemsQuantity = getValues(`${EXPENSE_DETAIL}.${type.id}`).length;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${EXPENSE_DETAIL}.${type.id}`,
  });

  return (
    <div className={styles.expenseItemsForType}>
      <Main className={styles.type}>
        {type.name} ({itemsQuantity})
      </Main>
      {fields && fields.length ? (
        <div className={styles.box}>
          {fields.map((field, index) => {
            return (
              <ExpenseItemInputs
                key={field.id}
                onRemove={() => {
                  remove(index);
                }}
                isRemovable={itemsQuantity > 1}
                fieldNamePrefix={`${EXPENSE_DETAIL}.${type.id}.${index}`}
                cropVarietyOptions={cropVarietyOptions}
                animalOptions={animalOptions}
              />
            );
          })}
        </div>
      ) : null}
      <AddLink
        onClick={() => {
          append({ [DATE]: getLocalDateInYYYYDDMM(), [NOTE]: '', [VALUE]: null });
        }}
      >
        {t('common:ADD_ANOTHER_ITEM')}
      </AddLink>
    </div>
  );
}

ExpenseItemsForType.propTypes = {
  type: PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }),
  cropVarietyOptions: PropTypes.array,
  animalOptions: PropTypes.array,
};
