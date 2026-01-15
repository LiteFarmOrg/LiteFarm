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

import { QueryStatus, skipToken } from '@reduxjs/toolkit/query/react';
import { useSelector } from 'react-redux';
import { useGetAnimalsQuery as useGetAnimalsRaw } from './apiSlice';
import { loginSelector } from '../../containers/userFarmSlice';
import { Animal } from './types';

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
function getUseQueryWithFarmId<Data, Args extends { farm_id: string }>(
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

export const useGetAnimalsQuery = getUseQueryWithFarmId<Animal[], { farm_id: string }>(
  useGetAnimalsRaw,
);
