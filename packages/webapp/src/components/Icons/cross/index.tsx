import React from 'react';
import styles from './cross.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

type CrossProps = {
  className?: string;
  isClickable?: boolean;
  onClick?: () => void;
};

const Cross = ({ className, onClick, isClickable, ...props }: CrossProps) => {
  return (
    <i
      className={clsx(styles.cross, isClickable && styles.clickable, className)}
      onClick={onClick}
      {...props}
    >
      &#215;
    </i>
  );
};

Cross.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Cross;
