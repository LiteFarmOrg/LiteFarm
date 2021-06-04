import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import clsx from 'clsx';

const CheckBoxPill = ({ label, value, checked, updateFilterState }) => {
  const handleChange = (e) => {
    updateFilterState(value);
  };

  return (
    <label className={clsx(styles.pill, checked ? styles.selected : styles.deselected)}>
      <input type={'checkbox'} checked={checked} onChange={handleChange} />
      <span>{label}</span>
    </label>
  );
};

CheckBoxPill.prototype = {
  label: PropTypes.string,
  value: PropTypes.string,
  checked: PropTypes.bool,
  updateFilterState: PropTypes.func,
};

export default CheckBoxPill;
