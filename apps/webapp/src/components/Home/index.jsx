import styles from './home.module.scss';
import PropTypes from 'prop-types';
import React from 'react';

export default function PureHome({ greeting, first_name, children, imgUrl }) {
  return (
    <div className={styles.container} style={{ backgroundImage: `url("${imgUrl}")` }}>
      <h3 className={styles.title}>
        {greeting}
        <br />
        {first_name}
      </h3>
      {children}
    </div>
  );
}

PureHome.prototype = {
  greeting: PropTypes.string,
  first_name: PropTypes.string,
  onClick: PropTypes.func,
};
