import React from 'react';
import { withStyles } from '@mui/styles';
import LinearProgress from '@mui/material/LinearProgress';

const CustomProgress = withStyles((theme) => ({
  root: {
    height: 5,
    borderRadius: 3,
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#66738A',
  },
}))(LinearProgress);

const ProgressBar = ({ classes = {}, value, style, ...props }) => {
  return (
    <div className={classes.root} style={style}>
      <CustomProgress variant="determinate" value={value} {...props} />
    </div>
  );
};

ProgressBar.propTypes = {};

export default ProgressBar;
