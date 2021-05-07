import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import clsx from 'clsx';

const CheckBoxPill = ({ label, defaultChecked }) => {
  const [checked, setChecked] = useState(defaultChecked);
  const handleChange = (e) => {
    setChecked(e.target.checked);
  };

  return (
    <label className={clsx(styles.pill, checked ? styles.selected : styles.deselected)}>
      <input type={'checkbox'} defaultChecked={defaultChecked} onChange={handleChange} />
      <span>{label}</span>
    </label>
  );
};

CheckBoxPill.prototype = {
  label: PropTypes.string,
  defaultChecked: PropTypes.bool,
};

export default CheckBoxPill;
