import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import CheckBoxPill from './CheckBoxPill';
import clsx from 'clsx';
import { BsChevronDown } from 'react-icons/bs';

const Filter = ({ subject, items, style }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={clsx(styles.container, open && styles.openContainer)} style={style}>
      <div className={clsx(styles.head, open && styles.openHead)} onClick={() => setOpen(!open)}>
        <div>{subject}</div>
        <BsChevronDown style={open ? { transform: 'scaleY(-1)' } : {}} />
      </div>
      {open && (
        <div className={styles.dropdown}>
          {items.map((item) => {
            return <CheckBoxPill label={item.label} />;
          })}
        </div>
      )}
    </div>
  );
};

Filter.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
};

export default Filter;
