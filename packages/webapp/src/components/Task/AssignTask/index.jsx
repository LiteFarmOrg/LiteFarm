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
import { Controller } from 'react-hook-form';
import { Label } from '../../Typography';
import ReactSelect from '../../Form/ReactSelect';
import HourlyWageInputs from './HourlyWageInputs';
import { ASSIGNEE } from './constants';
import styles from './styles.module.scss';

const AssignTask = ({
  intro,
  optional,
  contentForWorkerWithWage,
  additionalContent,
  assigneeOptions,
  register,
  control,
  selectedWorker,
  errors,
  showHourlyWageInputs,
  shouldSetWage,
  currency,
}) => {
  const { t } = useTranslation(['translation']);

  const AssigneeSelect = (
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
            style={{ marginTop: '8px', marginBottom: '6px' }}
            isSearchable
            optional={optional}
            inputRef={ref}
            value={value}
          />
        )}
      />
      {showHourlyWageInputs && (
        <Label className={styles.warning}>
          {t('ADD_TASK.HOURLY_WAGE.ASSIGNEE_WAGE_WARNING', { name: selectedWorker.label })}
        </Label>
      )}
    </div>
  );

  return (
    <>
      {intro}
      {AssigneeSelect}
      {showHourlyWageInputs ? (
        <HourlyWageInputs
          control={control}
          register={register}
          errors={errors}
          shouldSetWage={shouldSetWage}
          currency={currency}
        />
      ) : (
        contentForWorkerWithWage
      )}
      {additionalContent}
    </>
  );
};

export default AssignTask;
