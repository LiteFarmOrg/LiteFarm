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

type RawHook = (arg: any, options?: any) => any;

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
// Normal options (without selectFromResult)
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

function createWrapper<Data, Args>(rawHook: RawHook) {
  function inCreateWrapper<Selected = RawQueryResult<Data>>(
    extraArgs?: ExtraArgs<Args>,
    options?: UseQueryOptionsWithSelect<RawQueryResult<Data>, Selected>,
  ): Selected;

  // Overload for the plain / no-selectFromResult case
  function inCreateWrapper(
    extraArgs?: ExtraArgs<Args>,
    options?: BaseUseQueryOptions,
  ): RawQueryResult<Data>;

  // Implementation signature (TS needs this to unify both overloads)
  function inCreateWrapper(extraArgs?: ExtraArgs<Args>, options?: any): any {
    function useHookWithFarmId<Selected>(
      extraArgs: ExtraArgs<any> | undefined,
      options: UseQueryOptionsWithSelect<RawQueryResult<Data>, Selected>,
    ): Selected;

    function useHookWithFarmId(
      extraArgs?: ExtraArgs<any>,
      options?: BaseUseQueryOptions,
    ): RawQueryResult<Data>;

    function useHookWithFarmId(extraArgs?: any, options?: any): any {
      const { farm_id } = useSelector(loginSelector);
      if (!farm_id) {
        rawHook(skipToken);
      }

      const fullArg = { farm_id, ...extraArgs };

      return rawHook(fullArg, options);
    }
    return () => useHookWithFarmId(extraArgs, options);
  }
  return inCreateWrapper;
}

export const useGetAnimalsQuery = createWrapper<Animal[], { farm_id: string }>(useGetAnimalsRaw);
