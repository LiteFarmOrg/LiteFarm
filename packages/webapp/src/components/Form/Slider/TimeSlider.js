import React, { useEffect, useState } from 'react';
import { Slider } from '@material-ui/core';
import { getDuration } from './../../../util/index';
import { withStyles } from '@material-ui/core/styles';
import sliderStyles from './slider.module.scss';
import { Semibold, Main, Label } from '../../Typography';
import styles from '../../Typography/typography.module.scss';
import clsx from 'clsx';

const CustomSlider = withStyles({
  root: {
    color: '--teal900',
    height: 2,
    padding: '15px 0',
  },
})(Slider);

const TimeSlider = ({
  classes = {},
  initialTime = 15,
  step = 15,
  minimum = 15,
  max = 720,
  style,
  label,
  setValue,
  ...props
}) => {
  const [time, setTime] = useState(initialTime);
  const [duration, setDuration] = useState({ hours: 0, minutes: 0 });
  useEffect(() => {
    const { getDurationString, ...data } = getDuration(time);
    setDuration(data);
    setValue(time);
  }, [time]);
  const getTimeTag = (time, unit) => (
    <>
      <span className={clsx(styles.semibold, sliderStyles.time)}>{time}</span>
      <span className={clsx(sliderStyles.unit)}>{unit} </span>{' '}
    </>
  );

  return (
    <>
      <Label>{label ? label : ''}</Label>
      <div className={sliderStyles.rectangle} style={style}>
        <div className={sliderStyles.durationText}>
          {!duration.hours && !duration.minutes && (
            <Semibold className={clsx(sliderStyles.noTime)}>0m</Semibold>
          )}
          <>
            {!!duration.hours && getTimeTag(duration.hours, duration.hours > 1 ? 'hrs' : 'hr')}
            {!!duration.minutes && getTimeTag(duration.minutes, 'mins')}
          </>
        </div>
        <div>
          <CustomSlider
            value={time}
            step={step}
            min={minimum}
            onChange={(_, value) => setTime(value)}
            max={max}
            {...props}
          />
        </div>
      </div>
    </>
  );
};

TimeSlider.propTypes = {};

export default TimeSlider;
