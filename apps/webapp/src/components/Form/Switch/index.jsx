import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Main } from '../../Typography';

const Switch = ({ checked, onChange, label, ...props }) => {
  return (
    <div className={styles.container} {...props}>
      <label className={styles.switch}>
        <input onChange={onChange} checked={checked} type="checkbox" />
        <span className={clsx(styles.slider, styles.round)} />
      </label>
      {label && <Main>{label}</Main>}
    </div>
  );
};

Switch.propTypes = {
  onChange: PropTypes.func,
  label: PropTypes.string,
  checked: PropTypes.bool,
};

export default Switch;
