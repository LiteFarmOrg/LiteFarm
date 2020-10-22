import React from 'react';
import styles from './navbar.scss';
import clsx from 'clsx';



const Navbar = ({
}) => {
  return (
    <nav
      className={clsx(styles.navbar)}
    />
  );
};

Navbar.propTypes = {

}

export default Navbar;