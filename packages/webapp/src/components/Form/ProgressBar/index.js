import React from 'react';
import { withStyles } from '@material-ui/core';
import LinearProgress from '@material-ui/core/LinearProgress';

const CustomProgress = withStyles((theme) => ({
    root: {
      height: 5,
      borderRadius: 2,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: '#2b3136',
    },
}))(LinearProgress);

const ProgressBar = ({
    classes = {},
}) => {
    return (
        <div className = {classes.root}>
            <CustomProgress variant = "determinate" value={33} />
        </div>
    );
};


ProgressBar.propTypes = {};

export default ProgressBar;