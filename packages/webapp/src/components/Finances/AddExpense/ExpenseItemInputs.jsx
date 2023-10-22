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
import { IconLink } from '../../Typography';
import { ReactComponent as TrashIcon } from '../../../assets/images/document/trash.svg';
import Input from '../../Form/Input';
import { DATE, NOTE, VALUE } from './constants';
import styles from './styles.module.scss';
import { useCurrencySymbol } from '../../../containers/hooks/useCurrencySymbol';

export default function ExpenseItemInputs({ register, onRemove, getErrors }) {
  const { t } = useTranslation();

  return (
    <div className={styles.expenseItem}>
      <Input
        label={t('common:DATE')}
        type={'date'}
        hookFormRegister={register(DATE, { required: true })}
        errors={getErrors(DATE)}
      />
      <Input
        label={t('EXPENSE.ITEM_NAME')}
        errors={getErrors(NOTE)}
        hookFormRegister={register(NOTE, {
          required: true,
          maxLength: {
            value: 100,
            message: t('common:CHAR_LIMIT_ERROR', { value: 100 }),
          },
        })}
      />
      <Input
        type="number"
        label={t('EXPENSE.VALUE')}
        errors={getErrors(VALUE)}
        hookFormRegister={register(VALUE, {
          required: true,
          valueAsNumber: true,
          min: { value: 0 },
        })}
        currency={useCurrencySymbol()}
      />
      <IconLink
        className={styles.iconLink}
        icon={<TrashIcon className={styles.icon} />}
        onClick={onRemove}
        isIconClickable
        underlined={false}
      >
        {t('common:REMOVE_ITEM')}
      </IconLink>
    </div>
  );
}

ExpenseItemInputs.propTypes = {
  register: PropTypes.func,
  onRemove: PropTypes.func,
  onChange: PropTypes.func,
  getErrors: PropTypes.func,
};
