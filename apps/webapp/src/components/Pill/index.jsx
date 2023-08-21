import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import clsx from 'clsx';

const Pill = ({ body, active, spaceBefore }) => {
  return (
    <span
      className={clsx(
        styles.pill,
        active ? styles.active : styles.inactive,
        spaceBefore && styles.spaceBefore,
      )}
    >
      {body}
    </span>
  );
};

Pill.propTypes = {
  body: PropTypes.string,
  active: PropTypes.bool,
  spaceBefore: PropTypes.bool,
};

export default Pill;
