import styles from './home.module.scss';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

export default function PureHome({ greeting, first_name, children, imgUrl }) {
  return (
    <div className={styles.container} style={{ backgroundImage: `url("${imgUrl}")` }}>
      <Link className={styles.manage} to={{ pathname: '/irrigation_prescription/78734' }}>
        VRI
      </Link>
      <br />
      <Link className={styles.manage} to={{ pathname: 'irrigation_prescription/uri_pk' }}>
        URI
      </Link>
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
