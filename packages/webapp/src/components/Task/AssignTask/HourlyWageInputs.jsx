/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import RadioGroup from '../../Form/RadioGroup';
import Input, { numberOnKeyDown } from '../../Form/Input';
import { HOURLY_WAGE, HOURLY_WAGE_ACTION, HourlyWageAction } from './constants';
import styles from './styles.module.scss';
import { useCurrencySymbol } from '../../../containers/hooks/useCurrencySymbol';

const HourlyWageInputs = ({
  register,
  control,
  errors,
  shouldSetWage,
  onHourlyWageActionChange,
}) => {
  const { t } = useTranslation(['translation']);

  const currencySymbol = useCurrencySymbol();

  const radioOptions = [
    {
      label: t('common:YES'),
      value: HourlyWageAction.FOR_THIS_TASK,
    },
    {
      label: t('common:NO'),
      value: HourlyWageAction.NO,
    },
  ];

  return (
    <div className={styles.hourlyWageInputs}>
      <Main style={{ marginBottom: '10px' }}>
        {t('ADD_TASK.TASK_WAGE.WANT_TO_SET_HOURLY_WAGE')}
      </Main>
      <RadioGroup
        hookFormControl={control}
        name={HOURLY_WAGE_ACTION}
        radios={radioOptions}
        data-cy="hourlyWageInputs-action"
        style={{ marginBottom: '20px' }}
        row
        onChange={onHourlyWageActionChange}
      />
      {shouldSetWage && (
        <Input
          unit={currencySymbol + t('ADD_TASK.HR')}
          data-cy="hourlyWageInputs-wage"
          label={t('WAGE.HOURLY_WAGE')}
          step="0.01"
          type="number"
          onKeyPress={numberOnKeyDown}
          hookFormRegister={register(HOURLY_WAGE, {
            required: true,
            valueAsNumber: true,
            min: { value: 0, message: t('WAGE.HOURLY_WAGE_RANGE_ERROR') },
            max: { value: 999999999, message: t('WAGE.HOURLY_WAGE_RANGE_ERROR') },
          })}
          style={{ marginBottom: '24px' }}
          errors={errors[HOURLY_WAGE] && (errors[HOURLY_WAGE].message || t('WAGE.ERROR'))}
          toolTipContent={t('WAGE.HOURLY_WAGE_TOOLTIP')}
        />
      )}
    </div>
  );
};

export default HourlyWageInputs;
