import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  colorPrimary: {
    backgroundColor: 'transparent',
  },
  barColorPrimary: {
    backgroundColor: '#037A0F',
  },
  bar: 300,
});

export default function ProgressBar({ closeSuccessHeader }) {
  const classes = useStyles();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          closeSuccessHeader();
          return 0;
        }
        const diff = Math.random() * 28;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

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
          barColorPrimary: classes.barColorPrimary,
          height: classes.height,
        }}
      />
    </div>
  );
}
