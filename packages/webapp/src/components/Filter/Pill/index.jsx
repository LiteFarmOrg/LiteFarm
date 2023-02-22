import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { BsX } from 'react-icons/bs';

const Pill = ({ className, label, selected, disabled, removable, onRemovePill }) => {
  return (
    <div
      className={clsx(
        className,
        styles.pill,
        selected ? styles.selected : disabled ? styles.disabled : styles.deselected,
      )}
    >
      {label}
      {removable && (
        <BsX
          data-cy="pill-close"
          style={{
            fontSize: '18px',
            marginLeft: '4px',
          }}
          onClick={onRemovePill}
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
