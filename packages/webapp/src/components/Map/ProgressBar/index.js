import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
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

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          onDismiss();
          return 0;
        }
        const diff = Math.random() * 28;
        return Math.min(oldProgress + diff, 100);
      });
    }, 250);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={classes.root}>
      <LinearProgress
        variant="determinate"
        value={progress}
        classes={{
          colorPrimary: classes.colorPrimary,
          barColorPrimary: classes[type],
        }}
      />
    </div>
  );
}
