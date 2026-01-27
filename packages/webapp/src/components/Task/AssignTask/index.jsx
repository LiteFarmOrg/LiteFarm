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
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { Label } from '../../Typography';
import ReactSelect from '../../Form/ReactSelect';
import HourlyWageInputs from './HourlyWageInputs';
import { ASSIGNEE } from './constants';
import styles from './styles.module.scss';
import { useCurrencySymbol } from '../../../containers/hooks/useCurrencySymbol';
import { roundToTwo } from '../../../util/rounding';

const AssignTask = ({
  intro,
  optional,
  additionalContent,
  assigneeOptions,
  register,
  control,
  selectedWorker,
  errors,
  showHourlyWageInputs,
  shouldSetWage,
  toolTipContent,
  userFarmWage,
}) => {
  const { t } = useTranslation(['translation']);

  const currencySymbol = useCurrencySymbol();

  const AssigneeSelect = useMemo(() => {
    return (
      <div className={styles.mb24}>
        <Controller
          control={control}
          name={ASSIGNEE}
          render={({ field: { onChange, ref, value } }) => (
            <ReactSelect
              data-cy="assignTask-assignee"
              label={t('ADD_TASK.ASSIGNEE')}
              options={assigneeOptions}
              onChange={onChange}
              isSearchable
              optional={optional}
              inputRef={ref}
              value={value}
              toolTipContent={toolTipContent}
            />
          )}
        />
        {selectedWorker?.value !== null && (
          <>
            {userFarmWage > 0 ? (
              <Label className={styles.info}>
                {t('ADD_TASK.HOURLY_WAGE.ASSIGNEE_CURRENT_WAGE', {
                  name: selectedWorker.label.trim(),
                  wage: `${currencySymbol}${roundToTwo(userFarmWage)}`,
                })}
              </Label>
            ) : (
              <Label className={styles.warning}>
                {t('ADD_TASK.HOURLY_WAGE.ASSIGNEE_WAGE_WARNING', { name: selectedWorker.label })}
              </Label>
            )}
          </>
        )}
      </div>
    );
  }, [assigneeOptions, optional, selectedWorker, control, userFarmWage, currencySymbol]);

  return (
    <>
      {intro}
      {AssigneeSelect}
      {showHourlyWageInputs && (
        <HourlyWageInputs
          control={control}
          register={register}
          errors={errors}
          shouldSetWage={shouldSetWage}
        />
      )}
      {additionalContent}
    </>
  );
};

export default AssignTask;
