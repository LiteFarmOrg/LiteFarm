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

import { useCallback, useEffect, useRef, useState } from 'react';
import { GeocodeResult, searchAddress } from '../util/geocoding/geocoder';

type Search = (query: string, options: { signal: AbortSignal }) => Promise<GeocodeResult[]>;

type Options = {
  /** Wait this long after the last call to `search` before querying. */
  debounceMs?: number;
  /** Queries shorter than this clear the suggestions instead of searching. */
  minLength?: number;
  searchFn?: Search;
};

/**
 * Address suggestions for a text input. Each new query cancels the previous one, so a slow
 * response for an old query can never replace the suggestions for the current one.
 */
export const useGeocodeSuggestions = ({
  debounceMs = 350,
  minLength = 3,
  searchFn = searchAddress,
}: Options = {}) => {
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const controllerRef = useRef<AbortController>();

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
    controllerRef.current?.abort();
    controllerRef.current = undefined;
  }, []);

  const clear = useCallback(() => {
    cancel();
    setSuggestions([]);
    setIsLoading(false);
    setHasError(false);
    setHasSearched(false);
  }, [cancel]);

  const run = useCallback(
    async (query: string) => {
      const controller = new AbortController();
      controllerRef.current = controller;
      setIsLoading(true);
      setHasError(false);
      try {
        const results = await searchFn(query, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setSuggestions(results);
        setIsLoading(false);
        setHasSearched(true);
      } catch (error) {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setHasError(true);
        setIsLoading(false);
        setHasSearched(true);
      }
    },
    [searchFn],
  );

  /** Debounced search, for search-as-you-type. */
  const search = useCallback(
    (query: string) => {
      cancel();
      if (query.trim().length < minLength) {
        setSuggestions([]);
        setIsLoading(false);
        setHasError(false);
        setHasSearched(false);
        return;
      }
      timerRef.current = setTimeout(() => run(query), debounceMs);
    },
    [cancel, run, debounceMs, minLength],
  );

  /** Immediate search, for an explicit submit. */
  const searchNow = useCallback(
    (query: string) => {
      cancel();
      if (query.trim().length < minLength) return;
      run(query);
    },
    [cancel, run, minLength],
  );

  useEffect(() => cancel, [cancel]);

  return { suggestions, isLoading, hasError, hasSearched, search, searchNow, clear };
};
