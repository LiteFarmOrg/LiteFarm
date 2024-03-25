/*
 *  Copyright (c) 2024 LiteFarm.org
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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../Form/Input';

export function FilterDate({ defaultValue, onChange, subject, shouldReset, props }) {
  const [date, setDate] = useState(defaultValue ?? '');

  useEffect(() => {
    if (shouldReset) {
      setDate('');
      onChange('');
    }
  }, [shouldReset]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
    onChange(e.target.value);
  };

  return (
    <Input label={subject} type={'date'} value={date} onChange={handleDateChange} {...props} />
  );
}

FilterDate.propTypes = {
  label: PropTypes.string,
  selected: PropTypes.bool,
  removable: PropTypes.bool,
  shouldReset: PropTypes.number,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  subject: PropTypes.string,
  props: PropTypes.object,
};
