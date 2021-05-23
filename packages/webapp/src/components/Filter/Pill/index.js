import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { BsX } from 'react-icons/bs';

const Pill = ({ label, selected, removable }) => {
  return (
    <div className={clsx(styles.pill, selected ? styles.selected : styles.deselected)}>
      {label}
      {removable && (
        <BsX
          style={{
            fontSize: '18px',
            marginLeft: '4px',
          }}
        />
      )}
    </div>
  );
};

Pill.prototype = {
  label: PropTypes.string,
  selected: PropTypes.bool,
  removable: PropTypes.bool,
};

export default Pill;
