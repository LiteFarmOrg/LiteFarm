import { FiFilter } from 'react-icons/all';
import Input from '../../Form/Input';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';
import Pill from '../../Filter/Pill';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    gap: '16px',
    position: 'relative',
    alignItems: 'center',
    paddingBottom: '16px',
  },
  circle: {
    position: 'absolute',
    right: 0,
    width: '4px',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: colors.teal700,
    transform: 'translate(-9px, -14px)',
  },
  filter: {
    fontSize: '24px',
    color: colors.grey600,
  },
  pillContainer: {
    paddingBottom: '16px',
    flexWrap: 'wrap',
    display: 'flex',
    gap: '16px',
  },
});

export default function PureSearchbarAndFilter({ filterOptions }) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.container}>
        <Input isSearchBar classes={{ container: { flexGrow: 1 } }} />
        {filterOptions?.length && <div className={classes.circle} />}
        <FiFilter className={classes.filter} />
      </div>

      <div className={classes.pillContainer}>
        {filterOptions &&
          filterOptions.length &&
          filterOptions.map((option, key) => <Pill item={option} removable selected key={key} />)}
      </div>
    </>
  );
}

PureSearchbarAndFilter.propTypes = {
  filterOptions: PropTypes.arrayOf(PropTypes.string),
};
