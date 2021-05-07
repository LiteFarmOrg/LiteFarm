import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../assets/theme';

import PropTypes from 'prop-types';

import { Semibold } from '../Typography';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexGrow: 1,
    gap: '8px',
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
});

export default function PageBreak({ label, children }) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
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
      <div className={classes.breakContainer}>
        <div className={classes.break} />
      </div>
    </div>
  );
}

PageBreak.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};
