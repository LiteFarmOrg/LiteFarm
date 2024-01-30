import React, { useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import RatingStar from '../../assets/images/rating/Star.svg?react';
import { Label } from '../Typography';
import { useTranslation } from 'react-i18next';

// TODO: this component is read-only, eventually will expand to support clicking/setting
const Rating = ({
  stars = 0,
  className,
  style,
  viewOnly = false,
  label,
  onRate,
  optional,
  disabled = false,
  initialRating = 0,
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  return (
    <>
      {label && (
        <div className={styles.labelContainer}>
          <Label style={{ marginBottom: '16px' }}>{label}</Label>
          {optional && <Label sm>{t('common:OPTIONAL')}</Label>}
        </div>
      )}
      <div className={clsx(!viewOnly && styles.gap8px, className)} style={style}>
        {[...Array(5)].map((star, index) => {
          index += 1;
          if (viewOnly) {
            return (
              <RatingStar
                key={index}
                className={clsx(styles.empty, index <= stars && styles.filled)}
                style={style}
              />
            );
          } else {
            return (
              <button
                type="button"
                key={index}
                onClick={
                  disabled
                    ? () => {}
                    : () => {
                        setRating(index);
                        onRate(index);
                      }
                }
                onMouseEnter={disabled ? () => {} : () => setHover(index)}
                onMouseLeave={disabled ? () => {} : () => setHover(rating)}
              >
                <RatingStar
                  style={{ width: '24px', height: '24px' }}
                  className={
                    index <= (hover || stars || rating) && !disabled ? styles.filled : styles.empty
                  }
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
