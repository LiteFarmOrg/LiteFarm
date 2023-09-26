/*
 *  Copyright 2023 LiteFarm.org
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
import { useForm } from 'react-hook-form';
import DateRangeSelector from '../../components/DateRangeSelector';
import { componentDecorators } from '../Pages/config/Decorators';
import { dateRangeOptions } from '../../components/DateRangeSelector/constants';
import { FROM_DATE, TO_DATE } from '../../components/Form/DateRangePicker';

export default {
  title: 'Components/DateRangeSelector',
  component: DateRangeSelector,
  decorators: componentDecorators,
};

const useFormMethods = () => {
  const {
    register,
    watch,
    setValue,
    getValues,
    setError,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
  });

  return {
    register,
    watch,
    setValue,
    getValues,
    setError,
    control,
    handleSubmit,
    formState: { errors, isValid },
  };
};

export const WithPlaceholder = {
  render: () => {
    const formMethods = useFormMethods();

    return <DateRangeSelector {...formMethods} placeholder="Select Date Range" />;
  },
};

export const WithDefaultOption = {
  render: () => {
    const formMethods = useFormMethods();

    return (
      <DateRangeSelector
        {...formMethods}
        defaultDateRangeOptionValue={dateRangeOptions.THIS_WEEK}
      />
    );
  },
};

export const WithDefaultCustomDateRange = {
  render: () => {
    const formMethods = useFormMethods();

    return (
      <DateRangeSelector
        {...formMethods}
        defaultDateRangeOptionValue={dateRangeOptions.CUSTOM}
        defaultCustomDateRange={{ [FROM_DATE]: '2023-01-01', [TO_DATE]: '2024-01-01' }}
      />
    );
  },
};
