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

import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureTaskRows from '../../../components/Task/TaskRows';
import { Semibold, Text } from '../../../components/Typography';
import styles from '../../../components/Task/TaskRows/styles.module.scss';
import { userFarmSelector } from '../../userFarmSlice';
import {
  useGetFieldRowPlanQuery,
  useGetTaskRowsQuery,
  useSetTaskRowsMutation,
} from '../../../store/api/rowPlanApi';
import { rowNumbersInPlan } from '../../../util/taskRows';

// The rows a sowing or field work task covers, and the field's row plan they come from.
// Shown only for a task on one field that has a row plan, or that already has rows.
export default function TaskRows({ task, canEdit }) {
  const { t } = useTranslation();
  const { farm_id } = useSelector(userFarmSelector);
  const { task_id } = task;
  const location_id = task.locations?.length === 1 ? task.locations[0].location_id : undefined;

  const { currentData: rows, isFetching, isError, isSuccess } = useGetTaskRowsQuery({ task_id });
  const { data: plan } = useGetFieldRowPlanQuery({ farm_id, location_id }, { skip: !location_id });
  const [setTaskRows, { isLoading: isSaving, isError: saveError }] = useSetTaskRowsMutation();

  const row_plan_id = plan?.properties?.row_plan_id;
  if (isError || isFetching || !isSuccess || !rows) {
    return (
      <div className={styles.rows} data-testid="task-rows">
        <Semibold className={styles.title}>{t('TASK.ROWS.TITLE')}</Semibold>
        <Text role={isError ? 'alert' : 'status'}>
          {t(isError ? 'TASK.ROWS.ERRORS.READ_FAILED' : 'TASK.ROWS.LOADING')}
        </Text>
      </div>
    );
  }
  if (!rows.length && !row_plan_id) return null;

  const onSave = (row_numbers) => {
    if (row_plan_id) setTaskRows({ task_id, row_plan_id, row_numbers });
  };

  return (
    <PureTaskRows
      rows={rows}
      planRowNumbers={rowNumbersInPlan(plan)}
      canEdit={!!canEdit && !!row_plan_id}
      isSaving={isSaving}
      saveError={saveError}
      onSave={onSave}
    />
  );
}

TaskRows.propTypes = {
  task: PropTypes.shape({
    task_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    locations: PropTypes.arrayOf(PropTypes.shape({ location_id: PropTypes.string })),
  }).isRequired,
  canEdit: PropTypes.bool,
};
