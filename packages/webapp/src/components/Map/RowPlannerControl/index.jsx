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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export default function RowPlannerControl({
  fields,
  fieldId,
  settings,
  surveyCount,
  isBusy,
  statusKey,
  summary,
  errorKey,
  errorMessage,
  hasPlan,
  onFieldChange,
  onSettingsChange,
  onSurveyFile,
  onPlan,
  onClear,
  onDownload,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const prefix = 'FARM_MAP.ROW_PLANNER.';
  const set = (key, value) => onSettingsChange({ ...settings, [key]: value });

  const numberInput = (key, labelKey, props) => (
    <label className={styles.field}>
      {t(prefix + labelKey)}
      <input
        type="number"
        value={settings[key]}
        disabled={isBusy}
        onChange={(event) => set(key, event.target.value)}
        {...props}
      />
    </label>
  );

  return (
    <div className={styles.control} data-cy="row-planner-control">
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="row-planner-panel"
        onClick={() => setOpen(!open)}
      >
        {t(prefix + 'TITLE')}
      </button>
      {open && (
        <div id="row-planner-panel" className={styles.panel}>
          {!fields.length ? (
            <p>{t(prefix + 'NO_FIELDS')}</p>
          ) : (
            <>
              <label className={styles.field}>
                {t(prefix + 'FIELD')}
                <select
                  value={fieldId ?? ''}
                  disabled={isBusy}
                  onChange={(event) => onFieldChange(event.target.value)}
                >
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </label>
              {numberInput('toolWidth', 'TOOL_WIDTH', { min: 0.5, step: 0.5 })}
              {!settings.contour && numberInput('angle', 'ANGLE', { step: 5 })}
              {numberInput('headland', 'HEADLAND', { min: 0, step: 1 })}
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={settings.snake}
                  disabled={isBusy}
                  onChange={(event) => set('snake', event.target.checked)}
                />
                {t(prefix + 'SNAKE')}
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={settings.contour}
                  disabled={isBusy}
                  onChange={(event) => set('contour', event.target.checked)}
                />
                {t(prefix + 'CONTOUR')}
              </label>
              {settings.contour && (
                <>
                  <label className={styles.field}>
                    {t(prefix + 'SURVEY')}
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      disabled={isBusy}
                      onChange={(event) => onSurveyFile(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  {surveyCount > 0 && (
                    <p className={styles.result}>
                      {t(prefix + 'SURVEY_LOADED', { count: surveyCount })}
                    </p>
                  )}
                  {numberInput('gridResolution', 'GRID', { min: 0.25, step: 0.25 })}
                </>
              )}
              <div className={styles.actions}>
                <button type="button" className={styles.button} disabled={isBusy} onClick={onPlan}>
                  {isBusy ? t(prefix + 'PLANNING') : t(prefix + 'PLAN')}
                </button>
                <button
                  type="button"
                  className={styles.button}
                  disabled={isBusy || !hasPlan}
                  onClick={onClear}
                >
                  {t(prefix + 'CLEAR')}
                </button>
                <button
                  type="button"
                  className={styles.button}
                  disabled={isBusy || !hasPlan}
                  onClick={onDownload}
                >
                  {t(prefix + 'DOWNLOAD')}
                </button>
              </div>
              {isBusy && statusKey && (
                <p className={styles.result} role="status">
                  {t(prefix + 'STATUS.' + statusKey)}
                </p>
              )}
              {errorKey && (
                <p className={styles.error} role="alert">
                  {t(prefix + 'ERRORS.' + errorKey)}
                </p>
              )}
              {errorMessage && (
                <p className={styles.error} role="alert">
                  {t(prefix + 'FAILED', { message: errorMessage })}
                </p>
              )}
              {summary && !isBusy && (
                <p className={styles.result}>
                  {!summary.rows
                    ? t(prefix + 'NO_ROWS')
                    : [
                        summary.fellBack && t(prefix + 'FELL_BACK'),
                        summary.contourUsed && t(prefix + 'CONTOUR_USED'),
                        t(prefix + 'RESULT', {
                          rows: summary.rows,
                          swath: summary.swathKm.toFixed(2),
                        }),
                        summary.passes > 0 &&
                          t(prefix + 'PATH', {
                            path: summary.pathKm.toFixed(2),
                            passes: summary.passes,
                          }),
                      ]
                        .filter(Boolean)
                        .join('\n')}
                </p>
              )}
              <p className={styles.note}>{t(prefix + 'NOTE')}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

RowPlannerControl.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string.isRequired, name: PropTypes.string }),
  ).isRequired,
  fieldId: PropTypes.string,
  settings: PropTypes.object.isRequired,
  surveyCount: PropTypes.number,
  isBusy: PropTypes.bool,
  statusKey: PropTypes.string,
  summary: PropTypes.object,
  errorKey: PropTypes.string,
  errorMessage: PropTypes.string,
  hasPlan: PropTypes.bool,
  onFieldChange: PropTypes.func.isRequired,
  onSettingsChange: PropTypes.func.isRequired,
  onSurveyFile: PropTypes.func.isRequired,
  onPlan: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};
