import React from 'react';
import { useTranslation } from 'react-i18next';
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
    color: 'var(--red700)',
  },
}));

export default function CompactPreview({ title, value, unit }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <div className={classes.title}>{title}:</div>
      <div className={value ? classes.value : classes.error}>
        {value ? value : t('SENSOR.READING.UNKNOWN')}
        {unit}
      </div>
    </div>
  );
}
