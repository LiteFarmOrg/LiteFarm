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

import {
  FetchBaseQueryError,
  QueryStatus,
  SkipToken,
  skipToken,
} from '@reduxjs/toolkit/query/react';
import { useSelector } from 'react-redux';
import { loginSelector } from '../../containers/userFarmSlice';
import { WithFarmId, WithFarmIdPayload } from './types';
import { FarmLibraryTag, FarmTag } from './apiTags';
import { LazyQueryTrigger, UseLazyQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks';

type RawQueryResult<T> = {
  data?: T;
  currentData?: T;
  isUninitialized: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: any;
  status: QueryStatus;
  startedTimeStamp?: number;
  fulfilledTimeStamp?: number;
};

type RawMutationResult<T> = {
  originalArgs?: unknown;
  data?: T;
  error?: unknown;
  endpointName?: string;
  fulfilledTimeStamp?: number;
  isUninitialized: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  startedTimeStamp?: number;
  reset: () => void;
};

type ExtraArgs<Arg> = Arg extends undefined ? undefined : Omit<Arg, 'farm_id'>;

type BaseUseQueryOptions = {
  pollingInterval?: number;
  skipPollingIfUnfocused?: boolean;
  refetchOnReconnect?: boolean;
  refetchOnFocus?: boolean;
  skip?: boolean;
  refetchOnMountOrArgChange?: boolean | number;
};

type UseQueryOptionsWithSelect<Result, Selected> = BaseUseQueryOptions & {
  selectFromResult: (result: Result) => Selected;
};

type UseLazyQueryOptions = Omit<BaseUseQueryOptions, 'skip'>;
type UseLazyQueryOptionsWithSelect<Result, Selected> = UseLazyQueryOptions & {
  selectFromResult: (result: Result) => Selected;
};

type BaseUseMutationOptions = {
  fixedCacheKey?: string;
};

type UseMutationOptionsWithSelect<Result, Selected> = BaseUseMutationOptions & {
  selectFromResult: (result: Result) => Selected;
};

/**
 * Helper function that contains the shared logic for injecting farm_id
 * into RTK Query hooks that expect an object argument.
 *
 * This is **not** meant to be used directly — it's an internal implementation detail.
 *
 * @internal
 */
function queryWithFarmId(
  rawHook: (arg: any, options?: any) => any,
  extraArgs?: any,
  options?: any,
): any {
  const { farm_id } = useSelector(loginSelector);
  if (!farm_id) {
    return rawHook(skipToken);
  }

  const fullArg = { farm_id, ...extraArgs };
  return rawHook(fullArg, options);
}

/**
 * Creates a farm-aware version of an RTK Query `useQuery` hook.
 *
 * Automatically injects `{ farm_id }` into the query argument object.
 * Supports both plain usage and usage with `selectFromResult`.
 *
 * @template Data - The type of data returned by the query (e.g. `Animal[]`, `Crop[]`, ...)
 * @template Args - The shape of the raw query argument
 *
 * @example
 * ```ts
 * // Plain usage — returns full query result
 * const { data, isLoading } = useGetAnimalsQuery();
 *
 * // With selectFromResult — returns only the selected slice with type inference
 * const { selectedAnimal } = useGetAnimalsQuery(undefined, {
 *   selectFromResult: ({ data }) => ({
 *     selectedAnimal: data?.find(a => a.id === someId),
 *   })
 * });
 * ```
 */
export function getUseQueryWithFarmId<Data, Args extends WithFarmId>(
  rawHook: (arg: Args, options?: any) => RawQueryResult<Data>,
) {
  // Overload 1: when selectFromResult is present
  function useQueryWithFarmId<Selected>(
    extraArgs: ExtraArgs<Args> | undefined,
    options: UseQueryOptionsWithSelect<RawQueryResult<Data>, Selected>,
  ): Selected;

  // Overload 2: plain call (no selectFromResult or no options)
  function useQueryWithFarmId(
    extraArgs?: ExtraArgs<Args>,
    options?: BaseUseQueryOptions,
  ): RawQueryResult<Data>;

  function useQueryWithFarmId(extraArgs?: ExtraArgs<Args>, options?: any): any {
    return queryWithFarmId(rawHook, extraArgs, options);
  }

  return useQueryWithFarmId;
}

export function getLazyUseQueryWithFarmId<Data, Args extends WithFarmId>(
  rawLazyHook: (
    options?: any,
  ) => [(arg: Args, preferCacheValue?: boolean) => Promise<any>, RawQueryResult<Data>, any],
) {
  // Overload 1: when selectFromResult is present
  function useLazyQueryWithFarmId<Selected>(
    options: UseQueryOptionsWithSelect<RawQueryResult<Data>, Selected>,
  ): [(arg?: ExtraArgs<Args>, preferCacheValue?: boolean) => Promise<any>, Selected, Args];

  // Overload 2: plain call (no selectFromResult or no options)
  function useLazyQueryWithFarmId(
    options?: BaseUseQueryOptions,
  ): [
    (arg?: ExtraArgs<Args>, preferCacheValue?: boolean) => Promise<any>,
    RawQueryResult<Data>,
    Args,
  ];

  function useLazyQueryWithFarmId(options?: any): any {
    const { farm_id } = useSelector(loginSelector);
    const [trigger, result, lastPromiseInfo] = rawLazyHook(options);
    if (!farm_id) {
      return [
        (extraArgs?: any, preferCacheValue?: boolean) =>
          trigger(skipToken as unknown as Args, preferCacheValue),
        result,
        lastPromiseInfo,
      ];
    }
    return [
      (extraArgs?: any, preferCacheValue?: boolean) =>
        trigger({ ...extraArgs, farm_id }, preferCacheValue),
      result,
      lastPromiseInfo,
    ];
  }

  return useLazyQueryWithFarmId;
}

// Helper to assert the shape we know exists at runtime
type AssertedMutationPromise<T> = Promise<T> & {
  unwrap: () => Promise<T>;
  abort?: () => void;
  reset?: () => void;
};

export function getMutationWithFarmId<Data, Args extends WithFarmIdPayload<any>>(
  rawMutationHook: (
    options?: any,
  ) => readonly [(arg: Args) => Promise<any>, RawMutationResult<Data>],
) {
  // Overload 1: when selectFromResult is present
  function useMutationWithFarmId<Selected>(
    options: UseMutationOptionsWithSelect<RawMutationResult<Data>, Selected>,
  ): [(arg?: Args['payload']) => AssertedMutationPromise<Data>, Selected];

  // Overload 2: plain call (no selectFromResult or no options)
  function useMutationWithFarmId(
    options?: BaseUseQueryOptions,
  ): [(arg?: Args['payload']) => AssertedMutationPromise<Data>, RawMutationResult<Data>];

  function useMutationWithFarmId(options?: any): any {
    const { farm_id } = useSelector(loginSelector);
    const [trigger, result] = rawMutationHook(options);
    if (!farm_id) {
      return [(extraArgs?: any) => trigger(skipToken as unknown as Args), result];
    }
    return [
      (extraArgs?: any) => trigger({ ...extraArgs, farm_id }) as AssertedMutationPromise<Data>,
      result,
    ];
  }

  return useMutationWithFarmId;
}

export function getFarmTagFn<Data, Args extends WithFarmId>(tag: FarmTag | FarmLibraryTag) {
  return (_result: Data | undefined, _error: FetchBaseQueryError | undefined, args: Args) => {
    return [{ type: tag, id: args.farm_id }];
  };
}

export function getInvalidateFarmTagsFn<Data, Args extends WithFarmId>(
  tags: (FarmTag | FarmLibraryTag)[],
) {
  return (_result: Data | undefined, _error: FetchBaseQueryError | undefined, args: Args) => {
    return tags.map((tag) => ({ type: tag, id: args.farm_id }));
  };
}
