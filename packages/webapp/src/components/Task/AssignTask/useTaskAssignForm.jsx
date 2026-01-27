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
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { ASSIGNEE, HOURLY_WAGE, HOURLY_WAGE_ACTION, hourlyWageActions } from './constants';

const isYesOptionSelected = (option) => {
  return option === hourlyWageActions.FOR_THIS_TASK;
};

/**
 * Custom hook to interact with AssignTask component.
 *
 * @typedef User
 * @type {object}
 *
 * @typedef AssigneeOption
 * @type {object}
 * @property {string} label - user name
 * @property {string} value - userId
 * @property {boolean} [isDisabled] - whether the user is disabled or not
 *
 * @typedef ReturnedObject
 * @type {object}
 * @property {function} control - function returned by useForm
 * @property {function} register - function returned by useForm
 * @property {function} watch - function returned by useForm
 * @property {function} setValue - function returned by useForm
 * @property {function} getValues - function returned by useForm
 * @property {function} clearErrors - function returned by useForm
 * @property {function} handleSubmit - function returned by useForm
 * @property {object} errors - errors returned by useForm
 * @property {boolean} disabled - true if form is not ready to be submitted
 * @property {AssigneeOption[]} assigneeOptions - assignee options used in ReactSelect component
 * @property {AssigneeOption} selectedWorker - selected assignee option
 * @property {string} [selectedHourlyWageAction] - 'set_hourly_wage', 'for_this_task', 'no', 'do_not_ask_again' or ''
 * @property {number} [hourlyWage] - wage inputted by user
 * @property {number} userFarmWage - user's current wage for the farm
 * @property {boolean} showHourlyWageInputs - whether to show HourlyWageInputs component or not
 * @property {boolean} shouldSetWage - whether user needs to set wage or not
 * @property {boolean} isValid - true if form doesn't have errors
 * @param {Object} props - hook properties
 * @param {User} props.user - logged in user
 * @param {User[]} props.users - users for the farm
 * @param {AssigneeOption} props.defaultAssignee - whether the task is assigned or not
 * @param {Object.<string, any>} [props.additionalFields={}] - any inputs with default values needed in the form
 *     in addition to assignee, hourly wage action and hourly wage. ex. { [ASSIGN_ALL]: false }
 * @param {number} [props.wage_at_moment] - wage for the task (may be user's farm wage or task override)
 * @param {boolean} [props.override_hourly_wage] - flag indicating if wage_at_moment is a task-specific override
 * @param {boolean} [props.disableUnAssignedOption] - whether to disable the unassigned option
 * @param {string} props.mode - validation strategy before submitting behaviour
 * @param {boolean} props.shouldUnregister - enable and disable input unregister after unmount
 * @returns {ReturnedObject}
 *
 */
const useTaskAssignForm = ({
  user,
  users,
  additionalFields = {},
  wage_at_moment,
  override_hourly_wage,
  defaultAssignee,
  disableUnAssignedOption,
  mode = 'onTouched',
  shouldUnregister,
}) => {
  const { t } = useTranslation();

  const selfOption = {
    label: `${user.first_name} ${user.last_name}`,
    value: user.user_id,
  };
  const unAssignedOption = { label: t('TASK.UNASSIGNED'), value: null, isDisabled: false };

  // Determine if task has a task-specific wage override
  const hasTaskWageOverride = override_hourly_wage === true;

  const {
    control,
    register,
    unregister,
    watch,
    formState: { isValid, errors },
    handleSubmit,
    getValues,
    setValue,
    clearErrors,
  } = useForm({
    mode: mode,
    shouldUnregister,
    defaultValues: {
      [ASSIGNEE]: defaultAssignee,
      [HOURLY_WAGE_ACTION]: hasTaskWageOverride ? hourlyWageActions.FOR_THIS_TASK : '',
      [HOURLY_WAGE]: hasTaskWageOverride ? wage_at_moment : null,
      ...additionalFields,
    },
  });

  const selectedWorker = watch(ASSIGNEE);
  const selectedHourlyWageAction = watch(HOURLY_WAGE_ACTION);
  const hourlyWage = watch(HOURLY_WAGE);

  const disabled = !selectedWorker || !isValid;
  const assigned = selectedWorker.label !== unAssignedOption.label;

  const assigneeOptions = useMemo(() => {
    if (user.is_admin) {
      const options = users
        .map(({ first_name, last_name, user_id, status }) => ({
          label: `${first_name} ${last_name}`,
          value: user_id,
          status,
        }))
        .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0))
        .filter((u) => u.status !== 'Inactive');
      unAssignedOption.isDisabled = disableUnAssignedOption;
      options.unshift(unAssignedOption);
      return options;
    } else {
      return [selfOption, unAssignedOption];
    }
  }, []);

  const userData = useMemo(() => {
    if (!assigned) {
      return {};
    }
    return users.find(({ user_id }) => user_id === selectedWorker.value) || {};
  }, [users, selectedWorker]);

  const showHourlyWageInputs = user.is_admin && selectedWorker && assigned;

  const shouldSetWage = useMemo(() => {
    let shouldSet = false;

    if (selectedHourlyWageAction) {
      shouldSet = isYesOptionSelected(selectedHourlyWageAction);
    }

    return shouldSet;
  }, [selectedHourlyWageAction]);

  // Prepopulate the hourly wage with the user's farm wage when no task override exists
  useEffect(() => {
    if (!override_hourly_wage && assigned) {
      setValue(HOURLY_WAGE, userData.wage?.amount || null);
    }
  }, [assigned, userData.wage?.amount, override_hourly_wage, setValue]);

  return {
    control,
    register,
    unregister,
    watch,
    errors,
    isValid,
    disabled,
    assigneeOptions,
    selectedWorker,
    selectedHourlyWageAction,
    hourlyWage,
    userFarmWage: userData.wage?.amount,
    showHourlyWageInputs,
    shouldSetWage,
    handleSubmit,
    getValues,
    setValue,
    clearErrors,
  };
};

export default useTaskAssignForm;
