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

const capitalize = (string) => {
  return string[0].toUpperCase() + string.slice(1);
};

export default function CompactPreview({ sensorReading, history }) {
  const classes = useStyles();
  const { reading_type, value, unit } = sensorReading;

  return (
    <div className={classes.container}>
      <div className={classes.title}>{capitalize(reading_type)}:</div>
      <div className={classes.value}>
        {value}
        {unit}
      </div>
    </div>
  );
}
