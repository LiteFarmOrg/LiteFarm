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

// Row selections for tasks. The grammar matches the api's parseRowSpec, which the station also
// reads: "12-18,21" is rows 12 to 18 and row 21.

export const MAX_TASK_ROWS = 2000;

export class RowSpecError extends Error {
  constructor(
    public code: 'EMPTY' | 'UNREADABLE' | 'BACKWARDS' | 'TOO_MANY',
    public part?: string,
  ) {
    super(code);
  }
}

export const parseRowSpec = (text: string): number[] => {
  if (typeof text !== 'string' || !text.trim()) throw new RowSpecError('EMPTY');
  const numbers = new Set<number>();
  for (const part of text.split(',')) {
    const match = /^\s*(\d+)\s*(?:-\s*(\d+))?\s*$/.exec(part);
    if (!match) throw new RowSpecError('UNREADABLE', part.trim());
    const from = Number(match[1]);
    const to = match[2] === undefined ? from : Number(match[2]);
    if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to))
      throw new RowSpecError('UNREADABLE', part.trim());
    if (to < from) throw new RowSpecError('BACKWARDS', part.trim());
    if (to - from >= MAX_TASK_ROWS) throw new RowSpecError('TOO_MANY');
    for (let n = from; n <= to; n++) numbers.add(n);
    if (numbers.size > MAX_TASK_ROWS) throw new RowSpecError('TOO_MANY');
  }
  return [...numbers].sort((a, b) => a - b);
};

// [12, 13, 14, 21] -> "12-14,21". A pair stays a pair ("12,13"), a range needs three or more.
export const formatRowSpec = (numbers: number[]): string => {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    if (j - i >= 2) parts.push(`${sorted[i]}-${sorted[j]}`);
    else for (let k = i; k <= j; k++) parts.push(String(sorted[k]));
    i = j + 1;
  }
  return parts.join(',');
};

// The row numbers in a plan's GeoJSON export. A row split by an obstacle appears once per fragment.
export const rowNumbersInPlan = (
  collection:
    | {
        features?: { properties?: { role?: string; row?: number } }[];
      }
    | null
    | undefined,
): number[] => {
  const numbers = new Set<number>();
  collection?.features?.forEach((feature) => {
    const { role, row } = feature.properties ?? {};
    if (role === 'row' && Number.isInteger(row)) numbers.add(row as number);
  });
  return [...numbers].sort((a, b) => a - b);
};

export interface TaskRowStatus {
  row_number: number;
  status: 'pending' | 'done' | 'aborted';
}

// Rows with a result cannot be replaced from the web app, the api refuses it.
export const hasRowResults = (rows: TaskRowStatus[] | undefined): boolean =>
  !!rows?.some((row) => row.status !== 'pending');

export const countRowStatuses = (rows: TaskRowStatus[] | undefined) => {
  const counts = { pending: 0, done: 0, aborted: 0 };
  const seen = new Map<number, TaskRowStatus['status']>();
  // Count a row once, whatever number of fragments it has. Any unfinished fragment keeps it pending.
  rows?.forEach(({ row_number, status }) => {
    const before = seen.get(row_number);
    if (before === undefined) seen.set(row_number, status);
    else if (before !== 'pending' && status === 'pending') seen.set(row_number, 'pending');
    else if (before === 'done' && status === 'aborted') seen.set(row_number, 'aborted');
  });
  seen.forEach((status) => counts[status]++);
  return counts;
};
