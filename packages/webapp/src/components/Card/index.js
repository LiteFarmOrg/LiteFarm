import React from 'react';
import styles from './card.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const Card = ({ color = 'primary', children = 'card', ...props }) => {
  return (
    <div className={clsx(styles.container, styles[color])} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary', 'active', 'disabled']),
  children: PropTypes.string,
  className: PropTypes.string,
};

export default Card;
