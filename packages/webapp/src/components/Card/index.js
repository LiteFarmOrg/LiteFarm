import React from 'react';
import styles from './card.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const Card = ({ color = 'primary', children = 'card', onClick, ...props }) => {
  return (
    <div className={clsx(styles.container, styles[color])} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary', 'active', 'disabled', 'blue', 'blueActive']),
  children: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Card;
