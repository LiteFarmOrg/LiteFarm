/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
export const OVERRIDE_HOURLY_WAGE = 'override_hourly_wage';
export const WAGE_OVERRIDE = 'wage_at_moment';
export const ASSIGNEE = 'assignee';
export const HOURLY_WAGE = 'hourly_wage';
export const HOURLY_WAGE_ACTION = 'hourly_wage_action';
export const ASSIGN_ALL = 'assign_all';

export const hourlyWageActions = {
  SET_HOURLY_WAGE: 'set_hourly_wage',
  FOR_THIS_TASK: 'for_this_task',
  NO: 'no',
  DO_NOT_ASK_AGAIN: 'do_not_ask_again',
};

export const assignTaskFields = [ASSIGNEE, HOURLY_WAGE, HOURLY_WAGE_ACTION, ASSIGN_ALL];
