import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';
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
});

const StatusLabel = ({ status = 'forReview', task, assignee = null, style, onClick, ...props }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const statusText = {
    forReview: t('TASK.STATUS.FOR_REVIEW'),
    planned: t('TASK.STATUS.PLANNED'),
    completed: t('TASK.STATUS.COMPLETED'),
    late: t('TASK.STATUS.LATE'),
    abandoned: t('TASK.STATUS.ABANDONED'),
  };

  return <div className={clsx(classes.container, classes[status])}>{statusText[status]}</div>;
};

StatusLabel.propTypes = {
  status: PropTypes.oneOf(['forReview', 'planned', 'late', 'completed', 'abandoned']),
};

export default StatusLabel;
