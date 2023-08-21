import { makeStyles } from '@mui/styles';
import { colors } from '../../assets/theme';
import Square from '../Square';

import PropTypes from 'prop-types';

import { Semibold, Underlined } from '../Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    gap: '8px',
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breakContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  break: {
    display: 'inline-block',
    borderTop: '1px solid',
    width: '100%',
    transform: 'translateY(-5px)',
    color: colors.grey400,
  },
  label: {
    color: colors.grey600,
  },
  documentCountContainer: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
});

export default function PageBreak({ label, square, children, style, onSelectAll, onClearAll }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.container} style={style}>
      {label && (
        <div className={classes.labelContainer}>
          {label && (
            <Semibold sm className={classes.label}>
              {label}
            </Semibold>
          )}

          {children}
        </div>
      )}
      {square && (
        <div className={classes.documentCountContainer}>
          {square && <Square color={square.type}>{square.count}</Square>}
        </div>
      )}
      <div className={classes.breakContainer}>
        <div className={classes.break} />
      </div>
      <>
        {onSelectAll && (
          <Underlined style={{ color: colors.brown700 }} onClick={onSelectAll}>
            {t('ADD_TASK.SELECT_ALL')}
          </Underlined>
        )}
        {onSelectAll && onClearAll && ' | '}
        {onClearAll && (
          <Underlined style={{ color: colors.brown700 }} onClick={onClearAll}>
            {t('ADD_TASK.CLEAR_ALL')}
          </Underlined>
        )}
      </>
    </div>
  );
}

PageBreak.propTypes = {
  label: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  style: PropTypes.object,
};
