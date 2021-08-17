import React, { useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { ReactComponent as RatingStar } from '../../assets/images/rating/Star.svg';
import { Label } from '../Typography';

// TODO: this component is read-only, eventually will expand to support clicking/setting
const Rating = ({ stars = 0, className, style, viewOnly = false, label, onRate }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  return (
    <>
      {label && <Label style={{ marginBottom: '16px' }}>{label}</Label>}
      <div className={className} style={style}>
        {[...Array(5)].map((star, index) => {
          index += 1;
          if (viewOnly) {
            return (
              <RatingStar
                key={index}
                className={clsx(styles.empty, index <= stars && styles.filled)}
              />
            );
          } else {
            return (
              <button
                type="button"
                key={index}
                onClick={() => {
                  setRating(index);
                  onRate(index);
                }}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(rating)}
              >
                <RatingStar
                  style={{ width: '24px', height: '24px' }}
                  className={index <= (hover || rating) ? styles.filled : styles.empty}
                />
              </button>
            );
          }
        })}
      </div>
    </>
  );
};

Rating.propTypes = {};

export default Rating;
