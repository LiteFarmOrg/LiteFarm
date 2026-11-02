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

// Partial mock: the shared Input imports the app's i18n setup, which needs the real plugin export.
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

import PureTaskRows from '../components/Task/TaskRows';

const row = (row_number: number, status = 'pending') => ({ row_number, status });
const planRowNumbers = Array.from({ length: 30 }, (_, i) => i + 1);

const setup = (props = {}) => {
  const onSave = vi.fn();
  render(
    <PureTaskRows
      rows={[]}
      planRowNumbers={planRowNumbers}
      canEdit
      isSaving={false}
      saveError={false}
      onSave={onSave}
      {...props}
    />,
  );
  return { onSave, input: screen.queryByRole('textbox') as HTMLInputElement | null };
};

afterEach(cleanup);

describe('PureTaskRows', () => {
  it('summarises the rows on the task', () => {
    setup({ rows: [row(12), row(13), row(14), row(15), row(21)], canEdit: false });
    expect(screen.getByText(/TASK\.ROWS\.SUMMARY/).textContent).toContain('"rows":"12-15,21"');
    expect(screen.getByText(/TASK\.ROWS\.SUMMARY/).textContent).toContain('"count":5');
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('saves the rows that were typed', () => {
    const { onSave, input } = setup();
    fireEvent.change(input!, { target: { value: '12-14,21' } });
    fireEvent.click(screen.getByRole('button', { name: 'TASK.ROWS.SAVE' }));
    expect(onSave).toHaveBeenCalledWith([12, 13, 14, 21]);
  });

  it('does not save text it cannot read', () => {
    const { onSave, input } = setup();
    fireEvent.change(input!, { target: { value: '12-x' } });
    fireEvent.click(screen.getByRole('button', { name: 'TASK.ROWS.SAVE' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/TASK\.ROWS\.ERRORS\.UNREADABLE/)).toBeTruthy();
  });

  it('does not save rows that are not in the plan', () => {
    const { onSave, input } = setup();
    fireEvent.change(input!, { target: { value: '28-33' } });
    fireEvent.click(screen.getByRole('button', { name: 'TASK.ROWS.SAVE' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/TASK\.ROWS\.ERRORS\.NOT_IN_PLAN/).textContent).toContain(
      '"rows":"31-33"',
    );
  });

  it('keeps the save button off until the rows change', () => {
    setup({ rows: [row(1)] });
    const save = screen.getByRole('button', { name: 'TASK.ROWS.SAVE' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1-2' } });
    expect(save.disabled).toBe(false);
  });

  it('locks the rows once any has a result', () => {
    setup({ rows: [row(1, 'done'), row(2)] });
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('TASK.ROWS.LOCKED')).toBeTruthy();
    expect(screen.getByText(/TASK\.ROWS\.DONE/).textContent).toContain('"count":1');
  });

  it('shows a failed save', () => {
    setup({ saveError: true });
    expect(screen.getByText('TASK.ROWS.ERRORS.SAVE_FAILED')).toBeTruthy();
  });
});
