import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../assets/theme';
import { FaExclamation } from 'react-icons/all';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const useStyles = makeStyles({
  container: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4px',
    minWidth: '16px',
    height: '16px',
    fontFamily: '"Open Sans"," SansSerif", serif',
    color: 'white',
    fontWeight: 700,
    borderRadius: '4px',
  },
  active: {
    backgroundColor: colors.teal700,
  },
  planned: {
    backgroundColor: colors.brown700,
  },
  past: {
    backgroundColor: colors.teal900,
  },
  needsPlan: {
    backgroundColor: colors.red700,
  },
  cropTile: {
    minWidth: '24px',
    height: '24px',
    borderRadius: 0,
  },
});

export default function Square({ color = 'active', children, isCropTile, ...props }) {
  const classes = useStyles();
  return (
    <div
      className={clsx(classes.container, classes[color], isCropTile && classes.cropTile)}
      {...props}
    >
      {color === 'needsPlan' ? <FaExclamation style={{ fontSize: '12px' }} /> : children}
    </div>
  );
}

Square.propTypes = {
  color: PropTypes.oneOf(['active', 'planned', 'past', 'needsPlan']),
  isCropTile: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};
