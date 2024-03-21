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
