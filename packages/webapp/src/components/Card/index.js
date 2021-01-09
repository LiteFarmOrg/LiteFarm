import React from 'react';
import styles from './card.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const Card = ({ color = 'primary', children = 'card', onClick, isButton, ...props }) => {
  return (
    <div className={clsx(styles.container, styles[color], isButton && styles.btn)} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary', 'active', 'disabled']),
  children: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  isButton: PropTypes.bool,
};

export default Card;
