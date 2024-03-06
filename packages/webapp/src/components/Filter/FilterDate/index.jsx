import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../Form/Input';

export function FilterDate({
  defaultValue,
  filterKey,
  onChange,
  subject,
  filterRef,
  shouldReset,
  props,
}) {
  const [date, setDate] = useState(defaultValue ?? '');

  useEffect(() => {
    if (shouldReset) {
      setDate('');
    }
  }, [shouldReset]);
  useEffect(() => {
    if (filterRef?.current) {
      filterRef.current[filterKey] = date || undefined;
    }
  }, [date]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
    onChange?.(e);
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
  filterRef: PropTypes.object,
  defaultValue: PropTypes.string,
  filterKey: PropTypes.string,
  onChange: PropTypes.func,
  subject: PropTypes.string,
  props: PropTypes.object,
};
