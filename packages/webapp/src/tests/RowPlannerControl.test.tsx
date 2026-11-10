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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

import RowPlannerControl from '../components/Map/RowPlannerControl';
import { DEFAULT_PLAN_SETTINGS } from '../util/rowPlanner';

const fields = [
  { id: 'f1', name: 'North' },
  { id: 'f2', name: 'South' },
];

const setup = (props = {}) => {
  const handlers = {
    onFieldChange: vi.fn(),
    onSettingsChange: vi.fn(),
    onSurveyFile: vi.fn(),
    onPlan: vi.fn(),
    onClear: vi.fn(),
    onDownload: vi.fn(),
    onSave: vi.fn(),
  };
  render(
    <RowPlannerControl
      fields={fields}
      fieldId="f1"
      settings={DEFAULT_PLAN_SETTINGS}
      surveyCount={0}
      isBusy={false}
      hasPlan={false}
      {...handlers}
      {...props}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'FARM_MAP.ROW_PLANNER.TITLE' }));
  return handlers;
};

afterEach(cleanup);

describe('RowPlannerControl', () => {
  it('is collapsed until the toggle is pressed', () => {
    render(
      <RowPlannerControl
        fields={fields}
        settings={DEFAULT_PLAN_SETTINGS}
        onFieldChange={vi.fn()}
        onSettingsChange={vi.fn()}
        onSurveyFile={vi.fn()}
        onPlan={vi.fn()}
        onClear={vi.fn()}
        onDownload={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.queryByRole('combobox')).toBeNull();
  });
  it('tells the user to draw a field when there are none', () => {
    setup({ fields: [] });
    expect(screen.getByText('FARM_MAP.ROW_PLANNER.NO_FIELDS')).toBeTruthy();
    expect(screen.queryByText('FARM_MAP.ROW_PLANNER.PLAN')).toBeNull();
  });
  it('reports field and setting changes', () => {
    const h = setup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'f2' } });
    expect(h.onFieldChange).toHaveBeenCalledWith('f2');
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '3' } });
    expect(h.onSettingsChange).toHaveBeenCalledWith({ ...DEFAULT_PLAN_SETTINGS, toolWidth: '3' });
  });
  it('hides the angle and shows the survey inputs for contour rows', () => {
    setup({ settings: { ...DEFAULT_PLAN_SETTINGS, contour: true }, surveyCount: 120 });
    expect(screen.queryByText('FARM_MAP.ROW_PLANNER.ANGLE')).toBeNull();
    expect(screen.getByText(/SURVEY_LOADED.*120/)).toBeTruthy();
  });
  it('fires plan, clear and download, with the last two needing a plan', () => {
    const h = setup();
    fireEvent.click(screen.getByText('FARM_MAP.ROW_PLANNER.PLAN'));
    expect(h.onPlan).toHaveBeenCalled();
    expect((screen.getByText('FARM_MAP.ROW_PLANNER.CLEAR') as HTMLButtonElement).disabled).toBe(
      true,
    );
    cleanup();
    const h2 = setup({ hasPlan: true });
    fireEvent.click(screen.getByText('FARM_MAP.ROW_PLANNER.CLEAR'));
    fireEvent.click(screen.getByText('FARM_MAP.ROW_PLANNER.DOWNLOAD'));
    expect(h2.onClear).toHaveBeenCalled();
    expect(h2.onDownload).toHaveBeenCalled();
  });
  it('saves only when there is a plan that is not already saved or saving', () => {
    const save = () =>
      screen.getByText(/^FARM_MAP\.ROW_PLANNER\.(SAVE|SAVED|SAVING)$/) as HTMLButtonElement;
    setup();
    expect(save().disabled).toBe(true);
    cleanup();
    const h = setup({ hasPlan: true });
    expect(save().disabled).toBe(false);
    fireEvent.click(save());
    expect(h.onSave).toHaveBeenCalledTimes(1);
    cleanup();
    setup({ hasPlan: true, isSaving: true });
    expect(save().textContent).toBe('FARM_MAP.ROW_PLANNER.SAVING');
    expect(save().disabled).toBe(true);
    cleanup();
    setup({ hasPlan: true, isSaved: true, saveWarnings: ['a', 'b'] });
    expect(save().textContent).toBe('FARM_MAP.ROW_PLANNER.SAVED');
    expect(save().disabled).toBe(true);
    expect(screen.getByRole('status').textContent).toContain('a; b');
  });
  it('shows a save error', () => {
    setup({ hasPlan: true, saveError: 'no rows in plan' });
    expect(screen.getByRole('alert').textContent).toContain('no rows in plan');
  });
  it('disables inputs and shows the status while busy', () => {
    setup({ isBusy: true, statusKey: 'LOADING_PYTHON' });
    expect((screen.getByRole('combobox') as HTMLSelectElement).disabled).toBe(true);
    expect(screen.getByRole('status').textContent).toBe(
      'FARM_MAP.ROW_PLANNER.STATUS.LOADING_PYTHON',
    );
  });
  it('shows validation errors, failures and results', () => {
    setup({ errorKey: 'TOOL_WIDTH', errorMessage: 'boom' });
    const alerts = screen.getAllByRole('alert').map((a) => a.textContent);
    expect(alerts[0]).toBe('FARM_MAP.ROW_PLANNER.ERRORS.TOOL_WIDTH');
    expect(alerts[1]).toContain('boom');
    cleanup();
    setup({
      summary: { rows: 0, swathKm: 0, pathKm: 0, passes: 0, contourUsed: false, fellBack: false },
    });
    expect(screen.getByText('FARM_MAP.ROW_PLANNER.NO_ROWS')).toBeTruthy();
    cleanup();
    setup({
      summary: {
        rows: 4,
        swathKm: 1.234,
        pathKm: 1.5,
        passes: 2,
        contourUsed: false,
        fellBack: true,
      },
    });
    const text = document.querySelector('p')!.parentElement!.textContent!;
    expect(text).toContain('FELL_BACK');
    expect(text).toContain('"swath":"1.23"');
    expect(text).toContain('"passes":2');
  });
});
