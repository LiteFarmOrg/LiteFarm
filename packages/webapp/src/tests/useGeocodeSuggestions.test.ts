import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGeocodeSuggestions } from '../hooks/useGeocodeSuggestions';
import type { GeocodeResult } from '../util/geocoding/geocoder';

const result = (label: string): GeocodeResult => ({ label, lat: 1, lng: 2, country: 'GB' });

describe('useGeocodeSuggestions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
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

  it('tracks loading, an empty successful search, errors, and recovery', async () => {
    let resolveSearch!: (value: GeocodeResult[]) => void;
    const searchFn = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSearch = resolve;
          }),
      )
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([result('Recovered')]);
    const { result: hook } = renderHook(() => useGeocodeSuggestions({ searchFn }));
    expect(hook.current).toMatchObject({
      suggestions: [],
      isLoading: false,
      hasSearched: false,
      hasError: false,
    });
    act(() => hook.current.searchNow('Bristol'));
    expect(hook.current).toMatchObject({ isLoading: true, hasSearched: false, hasError: false });
    await act(async () => resolveSearch([]));
    expect(hook.current).toMatchObject({
      suggestions: [],
      isLoading: false,
      hasSearched: true,
      hasError: false,
    });
    await act(async () => hook.current.searchNow('missing'));
    expect(hook.current).toMatchObject({
      suggestions: [],
      isLoading: false,
      hasSearched: true,
      hasError: true,
    });
    await act(async () => hook.current.searchNow('recovered'));
    expect(hook.current).toMatchObject({
      suggestions: [result('Recovered')],
      isLoading: false,
      hasSearched: true,
      hasError: false,
    });
    act(() => hook.current.clear());
    expect(hook.current).toMatchObject({
      suggestions: [],
      isLoading: false,
      hasSearched: false,
      hasError: false,
    });
  });

  it('searches immediately on submit and cancels the queued debounce', async () => {
    const searchFn = vi.fn().mockResolvedValue([result('Submitted')]);
    const { result: hook } = renderHook(() => useGeocodeSuggestions({ searchFn }));
    act(() => hook.current.search('queued query'));
    await act(async () => hook.current.searchNow('submitted query'));
    expect(searchFn).toHaveBeenCalledWith('submitted query', { signal: expect.any(AbortSignal) });
    await act(async () => vi.advanceTimersByTimeAsync(1000));
    expect(searchFn).toHaveBeenCalledTimes(1);
  });

  it('trims for minimum length and honors custom debounce and minimum options', async () => {
    const searchFn = vi.fn().mockResolvedValue([]);
    const { result: hook } = renderHook(() =>
      useGeocodeSuggestions({ searchFn, minLength: 4, debounceMs: 50 }),
    );
    act(() => hook.current.search(' ab '));
    act(() => hook.current.searchNow(' abc '));
    await act(async () => vi.advanceTimersByTimeAsync(100));
    expect(searchFn).not.toHaveBeenCalled();
    act(() => hook.current.search(' abcd '));
    await act(async () => vi.advanceTimersByTimeAsync(49));
    expect(searchFn).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(searchFn.mock.calls[0][0]).toBe(' abcd ');
  });

  it.each(['clear', 'short query', 'unmount'] as const)(
    'cancels queued and active work on %s',
    async (action) => {
      let resolveSearch!: (value: GeocodeResult[]) => void;
      const searchFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSearch = resolve;
          }),
      );
      const { result: hook, unmount } = renderHook(() => useGeocodeSuggestions({ searchFn }));
      act(() => hook.current.searchNow('active query'));
      const signal = searchFn.mock.calls[0][1].signal as AbortSignal;
      expect(signal.aborted).toBe(false);
      if (action === 'clear') act(() => hook.current.clear());
      else if (action === 'short query') act(() => hook.current.search('ab'));
      else unmount();
      expect(signal.aborted).toBe(true);
      await act(async () => resolveSearch([result('Late response')]));
      if (action !== 'unmount') {
        expect(hook.current).toMatchObject({
          suggestions: [],
          isLoading: false,
          hasError: false,
          hasSearched: false,
        });
        act(() => hook.current.search('queued query'));
        if (action === 'clear') act(() => hook.current.clear());
        else act(() => hook.current.search('ab'));
      }
      await act(async () => vi.advanceTimersByTimeAsync(1000));
      expect(searchFn).toHaveBeenCalledTimes(1);
    },
  );

  it('ignores a rejected old request while the current request is still loading', async () => {
    let rejectFirst!: (error: Error) => void;
    let resolveSecond!: (value: GeocodeResult[]) => void;
    const searchFn = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectFirst = reject;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
      );
    const { result: hook } = renderHook(() => useGeocodeSuggestions({ searchFn }));
    act(() => hook.current.searchNow('first query'));
    act(() => hook.current.searchNow('second query'));
    await act(async () => rejectFirst(new Error('old request failed')));
    expect(hook.current).toMatchObject({ isLoading: true, hasError: false, hasSearched: false });
    await act(async () => resolveSecond([result('Second')]));
    expect(hook.current).toMatchObject({
      isLoading: false,
      hasError: false,
      suggestions: [result('Second')],
    });
  });

  it('cancels a pending debounce when unmounted', async () => {
    const searchFn = vi.fn().mockResolvedValue([]);
    const { result: hook, unmount } = renderHook(() => useGeocodeSuggestions({ searchFn }));
    act(() => hook.current.search('queued query'));
    unmount();
    await act(async () => vi.advanceTimersByTimeAsync(1000));
    expect(searchFn).not.toHaveBeenCalled();
  });
});
