import React from 'react';
import { withStyles } from '@material-ui/core';
import LinearProgress from '@material-ui/core/LinearProgress';

const CustomProgress = withStyles((theme) => ({
    root: {
      height: 5,
      borderRadius: 3,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: '#66738A',
    },
}))(LinearProgress);

const ProgressBar = ({
    classes = {},
    v,
    ...props
}) => {
    return (
        <div className = {classes.root}>
            <CustomProgress variant = "determinate" value={v} {...props} />
        </div>
    );
};


ProgressBar.propTypes = {

};

export default ProgressBar;