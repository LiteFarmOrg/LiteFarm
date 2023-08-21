import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import LinearProgress from '@mui/material/LinearProgress';
import { colors } from '../../../assets/theme';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  colorPrimary: {
    backgroundColor: 'transparent',
  },
  success: {
    backgroundColor: colors.brightGreen700,
  },
  error: {
    backgroundColor: colors.red700,
  },
});

export default function ProgressBar({ onDismiss, type = 'success' }) {
  const classes = useStyles();
  const [progress, setProgress] = useState(0);

  const INCREMENT = 12.5;
  const MAX_PROGRESS = 100 + INCREMENT;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= MAX_PROGRESS) {
          return MAX_PROGRESS;
        }
        return Math.min(oldProgress + INCREMENT, MAX_PROGRESS);
      });
    }, 250);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (progress >= MAX_PROGRESS) {
      onDismiss?.();
    }
  }, [progress]);

  return (
    <div className={classes.root}>
      <LinearProgress
        variant="determinate"
        value={Math.min(progress, 100)}
        classes={{
          colorPrimary: classes.colorPrimary,
          barColorPrimary: classes[type],
        }}
      />
    </div>
  );
}
