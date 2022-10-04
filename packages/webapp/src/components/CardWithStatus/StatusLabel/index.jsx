import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';
import clsx from 'clsx';

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
  active: {
    backgroundColor: colors.brightGreen700,
  },
  planned: {
    backgroundColor: colors.brown700,
  },
  completed: {
    backgroundColor: colors.teal900,
  },
  late: {
    backgroundColor: colors.red700,
  },
  abandoned: {
    backgroundColor: colors.grey600,
  },
  disabled: {
    backgroundColor: colors.grey200,
    color: colors.grey600,
  },
  forReview: {
    backgroundColor: colors.brightGreen700,
  },
  sm: {
    height: '16px',
    fontSize: '11px',
  },
});

export const StatusLabel = ({ color = 'active', label, sm, ...props }) => {
  const classes = useStyles();
  return (
    <div
      data-cy="status-label"
      className={clsx(classes.container, classes[color], sm && classes.sm)}
      {...props}
    >
      {label}
    </div>
  );
};

StatusLabel.propTypes = {
  color: PropTypes.oneOf(['active', 'planned', 'late', 'completed', 'abandoned', 'disabled']),
  label: PropTypes.string,
  sm: PropTypes.bool,
};
