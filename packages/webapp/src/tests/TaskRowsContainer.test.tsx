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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hooks = vi.hoisted(() => ({
  getRows: vi.fn(),
  getPlan: vi.fn(),
  setRows: vi.fn(),
}));

vi.mock('react-redux', () => ({ useSelector: () => ({ farm_id: 'farm' }) }));
vi.mock('../store/api/rowPlanApi', () => ({
  useGetTaskRowsQuery: hooks.getRows,
  useGetFieldRowPlanQuery: hooks.getPlan,
  useSetTaskRowsMutation: () => [hooks.setRows, {}],
}));
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

import TaskRows from '../containers/Task/TaskRows';

const task = { task_id: 1, locations: [{ location_id: 'field' }] };
const plan = {
  properties: { row_plan_id: 'plan' },
  features: [{ properties: { role: 'row', row: 1 } }],
};

beforeEach(() => {
  hooks.getPlan.mockReturnValue({ data: plan });
  hooks.setRows.mockReset();
});
afterEach(cleanup);

describe('TaskRows reads', () => {
  it('waits for a successful read before showing an empty assignment and allowing a save', () => {
    hooks.getRows.mockReturnValue({ isFetching: true, isSuccess: false });
    const { rerender } = render(<TaskRows task={task} canEdit />);
    expect(screen.getByRole('status').textContent).toBe('TASK.ROWS.LOADING');
    expect(screen.queryByText('TASK.ROWS.NONE')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();

    hooks.getRows.mockReturnValue({ currentData: [], isSuccess: true });
    rerender(<TaskRows task={task} canEdit />);
    expect(screen.getByText('TASK.ROWS.NONE')).toBeTruthy();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'TASK.ROWS.SAVE' }));
    expect(hooks.setRows).toHaveBeenCalledWith({
      task_id: 1,
      row_plan_id: 'plan',
      row_numbers: [1],
    });
  });

  it('shows a read error even with no plan or with cached rows', () => {
    hooks.getPlan.mockReturnValue({});
    hooks.getRows.mockReturnValue({
      currentData: [{ row_number: 1, status: 'pending' }],
      isError: true,
    });
    render(<TaskRows task={task} canEdit />);
    expect(screen.getByRole('alert').textContent).toBe('TASK.ROWS.ERRORS.READ_FAILED');
    expect(screen.queryByText('TASK.ROWS.NONE')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('blocks editing while refetching or waiting for the current task data', () => {
    hooks.getRows.mockReturnValue({ currentData: [], isSuccess: true, isFetching: true });
    const { rerender } = render(<TaskRows task={task} canEdit />);
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();

    hooks.getRows.mockReturnValue({ isSuccess: true, data: [] });
    rerender(<TaskRows task={{ ...task, task_id: 2 }} canEdit />);
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('continues to lock rows with results after a successful read', () => {
    hooks.getRows.mockReturnValue({
      currentData: [{ row_number: 1, status: 'done' }],
      isSuccess: true,
    });
    render(<TaskRows task={task} canEdit />);
    expect(screen.getByText('TASK.ROWS.LOCKED')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
