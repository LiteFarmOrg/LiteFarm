/*
 * Copyright 2026 LiteFarm.org
 * This file is part of LiteFarm and is licensed under the GNU General Public License v3 or later.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

describe('planner worker', () => {
  it('reports a Pyodide script import failure to the caller', async () => {
    const postMessage = vi.fn();
    const worker: any = {
      location: { href: 'https://example.com/sowbot-planner/planner.worker.js' },
      postMessage,
    };
    const importScripts = vi.fn(() => {
      throw new Error('download failed');
    });
    const script = readFileSync(resolve('public/sowbot-planner/planner.worker.js'), 'utf8');
    runInNewContext(script, { self: worker, URL, importScripts });
    expect(importScripts).not.toHaveBeenCalled();
    await worker.onmessage({ data: { id: 42, req: {}, csv: '' } });
    expect(postMessage).toHaveBeenLastCalledWith({ id: 42, ok: false, error: 'download failed' });
  });
});
