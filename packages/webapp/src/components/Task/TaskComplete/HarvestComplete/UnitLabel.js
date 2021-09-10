import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../../assets/theme';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  container: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4px 8px',
    height: '24px',
    fontFamily: '"Open Sans"," SansSerif", serif',
    color: 'white',
    fontWeight: 700,
    borderRadius: '4px',
  },
  positive: {
    backgroundColor: colors.blue700,
  },
  zero: {
    backgroundColor: colors.green700,
  },
  negative: {
    backgroundColor: colors.red700,
  }
});

const UnitLabel = ({ unitLabel = "kg", amount, style }) => {
  const classes = useStyles();
  const status = amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'zero';
  return <div className={clsx(classes.container, classes[status])} style={style}>{`${amount} ${unitLabel}`}</div>;
};

export default UnitLabel;