import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../../assets/theme';
import clsx from 'clsx';
import { convert } from '../../../../util/convert-units/convert';
import { roundToTwoDecimal } from '../../../../util/convert-units/unit';

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
    backgroundColor: colors.brightGreen700,
  },
  negative: {
    backgroundColor: colors.red700,
  },
});

const UnitLabel = ({ unitLabel = 'kg', amount, style }) => {
  const classes = useStyles();
  const status = Math.abs(amount) < 0.01 ? 'zero' : amount > 0 ? 'positive' : 'negative';
  return (
    <div className={clsx(classes.container, classes[status])} style={style}>{`${roundToTwoDecimal(
      convert(amount).from('kg').to(unitLabel),
    )} ${unitLabel}`}</div>
  );
};

export default UnitLabel;
