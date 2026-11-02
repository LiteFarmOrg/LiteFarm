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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import { Semibold, Text } from '../../Typography';
import {
  RowSpecError,
  countRowStatuses,
  formatRowSpec,
  hasRowResults,
  parseRowSpec,
} from '../../../util/taskRows';
import styles from './styles.module.scss';

const MAX_LISTED_MISSING = 5;

export default function PureTaskRows({
  rows,
  planRowNumbers,
  canEdit,
  isSaving,
  saveError,
  onSave,
}) {
  const { t } = useTranslation();
  const prefix = 'TASK.ROWS.';
  const current = [...new Set(rows.map((row) => row.row_number))].sort((a, b) => a - b);
  const [text, setText] = useState(formatRowSpec(current));
  const [error, setError] = useState('');
  const currentSpec = formatRowSpec(current);

  // Show what the task has once it loads or the saved rows change.
  useEffect(() => {
    setText(currentSpec);
    setError('');
  }, [currentSpec]);

  const locked = hasRowResults(rows);
  const counts = countRowStatuses(rows);

  const handleSave = () => {
    let numbers;
    try {
      numbers = parseRowSpec(text);
    } catch (e) {
      if (!(e instanceof RowSpecError)) throw e;
      setError(t(`${prefix}ERRORS.${e.code}`, { part: e.part }));
      return;
    }
    const inPlan = new Set(planRowNumbers);
    const missing = numbers.filter((n) => !inPlan.has(n));
    if (missing.length) {
      const listed = formatRowSpec(missing.slice(0, MAX_LISTED_MISSING));
      setError(t(`${prefix}ERRORS.NOT_IN_PLAN`, { rows: listed }));
      return;
    }
    setError('');
    onSave(numbers);
  };

  return (
    <div className={styles.rows} data-testid="task-rows">
      <Semibold className={styles.title}>{t(`${prefix}TITLE`)}</Semibold>
      <Text>
        {current.length
          ? t(`${prefix}SUMMARY`, { rows: currentSpec, count: current.length })
          : t(`${prefix}NONE`)}
      </Text>
      {locked && (
        <Text className={styles.counts}>
          {[
            t(`${prefix}DONE`, { count: counts.done }),
            t(`${prefix}ABORTED`, { count: counts.aborted }),
            t(`${prefix}PENDING`, { count: counts.pending }),
          ].join(', ')}
        </Text>
      )}
      {canEdit && locked && <Text className={styles.note}>{t(`${prefix}LOCKED`)}</Text>}
      {canEdit && !locked && (
        <div className={styles.editor}>
          <Input
            label={t(`${prefix}INPUT_LABEL`)}
            placeholder={t(`${prefix}EMPTY`)}
            value={text}
            onChange={(event) => setText(event.target.value)}
            errors={error || (saveError ? t(`${prefix}ERRORS.SAVE_FAILED`) : undefined)}
            disabled={isSaving}
          />
          <Button
            color="secondary"
            sm
            disabled={isSaving || text.trim() === currentSpec}
            onClick={handleSave}
          >
            {t(`${prefix}SAVE`)}
          </Button>
        </div>
      )}
    </div>
  );
}

PureTaskRows.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      row_number: PropTypes.number.isRequired,
      status: PropTypes.oneOf(['pending', 'done', 'aborted']).isRequired,
    }),
  ).isRequired,
  planRowNumbers: PropTypes.arrayOf(PropTypes.number).isRequired,
  canEdit: PropTypes.bool,
  isSaving: PropTypes.bool,
  saveError: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
};
