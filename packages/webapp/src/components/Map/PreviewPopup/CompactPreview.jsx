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
}));

export default function CompactPreview({ title, value, unit }) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.title}>{title}:</div>
      <div className={classes.value}>
        {value}
        {unit}
      </div>
    </div>
  );
}
