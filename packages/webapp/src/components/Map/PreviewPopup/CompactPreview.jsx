import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 200,
    padding: 5,
  },
  title: {},
  value: {
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
  },
}));

export default function CompactPreview({ title, value, unit }) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.title}>{title}:</div>
      <div className={value ? classes.value : classes.error}>
        {value ? value : 'Unknown'}
        {unit}
      </div>
    </div>
  );
}
