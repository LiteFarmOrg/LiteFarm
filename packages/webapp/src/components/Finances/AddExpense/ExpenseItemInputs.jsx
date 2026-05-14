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
import { useFormContext } from 'react-hook-form';
import { IconLink } from '../../Typography';
import { ReactComponent as TrashIcon } from '../../../assets/images/document/trash.svg';
import Input, { getInputErrors } from '../../Form/Input';
import ExpenseEntitySection from '../ExpenseEntitySection';
import { DATE, NOTE, VALUE } from './constants';
import { useCurrencySymbol } from '../../../containers/hooks/useCurrencySymbol';
import styles from './styles.module.scss';

export default function ExpenseItemInputs({
  onRemove,
  isRemovable,
  fieldNamePrefix,
  cropVarietyOptions,
  animalOptions,
}) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={styles.expenseItem}>
      <Input
        label={t('common:DATE')}
        type={'date'}
        hookFormRegister={register(`${fieldNamePrefix}.${DATE}`, { required: true })}
        errors={getInputErrors(errors, `${fieldNamePrefix}.${DATE}`)}
      />
      <Input
        label={t('EXPENSE.ITEM_NAME')}
        errors={getInputErrors(errors, `${fieldNamePrefix}.${NOTE}`)}
        hookFormRegister={register(`${fieldNamePrefix}.${NOTE}`, {
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
        errors={getInputErrors(errors, `${fieldNamePrefix}.${VALUE}`)}
        hookFormRegister={register(`${fieldNamePrefix}.${VALUE}`, {
          required: true,
          valueAsNumber: true,
          min: { value: 0 },
        })}
        currency={useCurrencySymbol()}
      />
      <ExpenseEntitySection
        fieldNamePrefix={fieldNamePrefix}
        cropVarietyOptions={cropVarietyOptions}
        animalOptions={animalOptions}
      />
      {isRemovable ? (
        <IconLink
          className={styles.iconLink}
          icon={<TrashIcon className={styles.icon} />}
          onClick={onRemove}
          isIconClickable
          underlined={false}
        >
          {t('common:REMOVE_ITEM')}
        </IconLink>
      ) : null}
    </div>
  );
}

ExpenseItemInputs.propTypes = {
  onRemove: PropTypes.func,
  isRemovable: PropTypes.bool,
  fieldNamePrefix: PropTypes.string,
  cropVarietyOptions: PropTypes.array,
  animalOptions: PropTypes.array,
};
