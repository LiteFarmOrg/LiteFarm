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
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import ExpenseItemsForType from './ExpenseItemsForType';
import { NOTE, VALUE } from './constants';

export default function ExpenseItemsForTypes({ types, setIsValid, ...props }) {
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {},
  });

  const setExpenses = () => {
    props.setExpenses(getValues());
  };

  useEffect(() => {
    types.forEach(({ id }) => {
      setValue(id, [{ [NOTE]: '', [VALUE]: null }]);
    });
    setExpenses();
  }, []);

  useEffect(() => {
    setIsValid(isValid);
  }, [isValid]);

  return types.map((type) => {
    return (
      <ExpenseItemsForType
        key={type.id}
        type={type}
        register={register}
        control={control}
        setValue={setValue}
        setExpenses={setExpenses}
        errors={errors}
      />
    );
  });
}

ExpenseItemsForTypes.propTypes = {
  types: PropTypes.array,
  setExpenses: PropTypes.func,
  setIsValid: PropTypes.func,
};
