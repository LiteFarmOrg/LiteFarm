import React from 'react';
import styles from './cross.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const Cross = ({ className, onClick, ...props }: { className?: string; onClick?: () => void }) => {
  return (
    <i className={clsx(styles.cross, className)} onClick={onClick} {...props}>
      &#215;
    </i>
  );
};

Cross.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Cross;
