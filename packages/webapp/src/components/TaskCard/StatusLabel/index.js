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
    padding: '4px',
    minWidth: '47px',
    height: '24px',
    fontFamily: '"Open Sans"," SansSerif", serif',
    color: 'white',
    fontWeight: 700,
    borderRadius: '4px',
  },
  forReview: {
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
  cropTile: {
    minWidth: '24px',
    height: '24px',
    borderRadius: 0,
  },
});

const StatusLabel = ({ status = 'forReview', task, assignee = null, style, onClick, ...props }) => {
  const classes = useStyles();

  return <div className={clsx(classes.container, classes[status])}>"for review"</div>;
};

StatusLabel.propTypes = {
  status: PropTypes.oneOf(['forReview', 'planned', 'late', 'completed', 'abandoned']),
};

export default StatusLabel;
