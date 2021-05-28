import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import Pill from '../Filter/Pill';
import clsx from 'clsx';
import { BsChevronDown } from 'react-icons/bs';

const ActiveFilterBox = ({ activeFilters, style }) => {
  const [firstRow, setFirstRow] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const elements = document.getElementsByClassName('uniqueClassName');
      let y = 0;
      let firstRowEle = 0;
      for (const element of elements) {
        const top = element.getClientRects()?.[0]?.top;
        if (!y) {
          y = top;
        } else if (y !== top) {
          setFirstRow(firstRowEle);
          return;
        }
        firstRowEle++;
      }
      setFirstRow(firstRowEle);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return (_) => window.removeEventListener('resize', handleResize);
  }, []);

  const numHidden = activeFilters.length - firstRow;

  // open
  if (open)
    return (
      <div className={clsx(styles.container)} style={style}>
        <div className={clsx(styles.pillContainer)}>
          {activeFilters.map((filter) => {
            return <Pill className={'uniqueClassName'} label={filter.label} selected removable />;
          })}
          {numHidden > 0 && (
            <button className={styles.test} onClick={() => setOpen(false)}>
              <BsChevronDown style={{ transform: 'scaleY(-1)' }} />
            </button>
          )}
        </div>
      </div>
    );

  // closed
  return (
    <div className={clsx(styles.container, styles.closedContainer)} style={style}>
      <div className={clsx(styles.pillContainer)}>
        {activeFilters.map((filter) => {
          return <Pill className={'uniqueClassName'} label={filter.label} selected removable />;
        })}
      </div>
      {numHidden > 0 && (
        <button className={styles.test} onClick={() => setOpen(true)}>
          {`+${numHidden}`}
          <BsChevronDown style={open ? { transform: 'scaleY(-1)' } : {}} />
        </button>
      )}
    </div>
  );
};

ActiveFilterBox.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
  filterKey: PropTypes.string,
};

export default ActiveFilterBox;

// const FilterCountDropdownButton = ({onClick, numHidden, open}) => {
//   return (
//     <button className={styles.test} onClick={onClick}>
//       {numHidden > 0 && !open && `+${numHidden}`}
//       <BsChevronDown style={open ? { transform: 'scaleY(-1)' } : {}} />
//     </button>
//   );
// }
