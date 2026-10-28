import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGeocodeSuggestions } from '../hooks/useGeocodeSuggestions';
import type { GeocodeResult } from '../util/geocoding/geocoder';

const result = (label: string): GeocodeResult => ({ label, lat: 1, lng: 2, country: 'GB' });

describe('useGeocodeSuggestions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces and only searches for the last query', async () => {
    const searchFn = vi.fn().mockResolvedValue([result('Bristol')]);
    const { result: hook } = renderHook(() => useGeocodeSuggestions({ searchFn, debounceMs: 300 }));

    act(() => hook.current.search('Bri'));
    act(() => hook.current.search('Bris'));
    act(() => hook.current.search('Bristol'));
    expect(searchFn).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(searchFn).toHaveBeenCalledTimes(1);
    expect(searchFn.mock.calls[0][0]).toBe('Bristol');
    expect(hook.current.suggestions).toEqual([result('Bristol')]);
  });

  it('ignores a slow response for an earlier query', async () => {
    let resolveFirst: (value: GeocodeResult[]) => void = () => {};
    const searchFn = vi
      .fn()
      .mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)))
      .mockResolvedValueOnce([result('Second')]);
    const { result: hook } = renderHook(() => useGeocodeSuggestions({ searchFn }));

    act(() => hook.current.searchNow('first query'));
    act(() => hook.current.searchNow('second query'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(hook.current.suggestions).toEqual([result('Second')]);

    await act(async () => {
      resolveFirst([result('First')]);
      await Promise.resolve();
    });
    expect(hook.current.suggestions).toEqual([result('Second')]);
  });

  it('clears for short queries and flags errors', async () => {
    const searchFn = vi.fn().mockRejectedValue(new Error('offline'));
    const { result: hook } = renderHook(() => useGeocodeSuggestions({ searchFn, minLength: 3 }));

    act(() => hook.current.search('ab'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(searchFn).not.toHaveBeenCalled();

    await act(async () => {
      hook.current.searchNow('abcd');
      await Promise.resolve();
    });
    expect(hook.current.hasError).toBe(true);
    expect(hook.current.suggestions).toEqual([]);

    act(() => hook.current.clear());
    expect(hook.current.hasError).toBe(false);
  });
});
