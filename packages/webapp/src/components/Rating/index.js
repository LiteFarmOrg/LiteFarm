import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { ReactComponent as RatingStar } from '../../assets/images/rating/Star.svg';

// TODO: this component is read-only, eventually will expand to support clicking/setting
const Rating = ({ stars = 0, className, style }) => {
  return (
    <div className={className} style={style}>
      {[1, 2, 3, 4, 5].map((index) => {
        return (
          <RatingStar key={index} className={clsx(styles.empty, index <= stars && styles.filled)} />
        );
      })}
    </div>
  );
};

Rating.propTypes = {};

export default Rating;
