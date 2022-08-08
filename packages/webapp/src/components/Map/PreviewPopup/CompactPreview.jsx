import React, { useState } from 'react';
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
  highlight: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 200,
    padding: 5,
    backgroundColor: 'rgb(243, 246, 251)',
  },
  title: {},
  value: {
    fontWeight: 'bold',
  },
  error: {
    color: 'var(--red700)',
  },
}));

export default function CompactPreview({ title, value, unit, loadReadingView }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [isClicked, setIsClicked] = useState(false);
  const handleClick = (e) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(loadReadingView, 250);
  };

  return (
    <div className={isClicked ? classes.highlight : classes.container} onClick={handleClick}>
      <div className={classes.title}>{title}:</div>
      <div className={value ? classes.value : classes.error}>
        {value ? value : t('SENSOR.READING.UNKNOWN')}
        {unit}
      </div>
    </div>
  );
}
