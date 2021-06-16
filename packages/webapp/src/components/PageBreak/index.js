import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../assets/theme';
import Square from '../Square';

import PropTypes from 'prop-types';

import { Semibold } from '../Typography';

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

export default function PageBreak({ label, square, children, style }) {
  const classes = useStyles();
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
          {square && (
            <Square color={square.type}>{square.count}</Square>
          )}
        </div>
      )}
      <div className={classes.breakContainer}>
        <div className={classes.break} />
      </div>
    </div>
  );
}

PageBreak.propTypes = {
  label: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  style: PropTypes.object,
};
