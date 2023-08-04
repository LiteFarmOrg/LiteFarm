import { FiFilter } from 'react-icons/fi';
import Input from '../../Form/Input';
import { makeStyles } from '@mui/styles';
import { colors } from '../../../assets/theme';
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
    cursor: 'pointer',
  },
  pillContainer: {
    paddingBottom: '16px',
    flexWrap: 'wrap',
    display: 'flex',
    gap: '16px',
  },
});

export default function PureSearchbarAndFilter({
  onFilterOpen,
  value,
  onChange,
  isFilterActive,
  disableFilter = false,
}) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.container}>
        <Input
          data-cy="crops-search"
          isSearchBar
          classes={{ container: { flexGrow: 1 } }}
          value={value}
          onChange={onChange}
        />
        {!disableFilter && (
          <>
            {isFilterActive && <div className={classes.circle} />}
            <FiFilter data-cy="tasks-filter" className={classes.filter} onClick={onFilterOpen} />
          </>
        )}
      </div>
    </>
  );
}

PureSearchbarAndFilter.propTypes = {
  onFilterOpen: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func,
  isFilterActive: PropTypes.bool,
  disableFilter: PropTypes.bool,
};
