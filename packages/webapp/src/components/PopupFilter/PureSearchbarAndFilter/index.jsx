import { FiFilter } from 'react-icons/fi';
import Input from '../../Form/Input';
import { makeStyles } from '@mui/styles';
import { colors } from '../../../assets/theme';
import PropTypes from 'prop-types';
import FilterButton from '../../Filter/FilterButton';
import clsx from 'clsx';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    gap: '8px',
    position: 'relative',
    alignItems: 'center',
    paddingBottom: '16px',
    height: '64px',
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
});

export default function PureSearchbarAndFilter({
  onFilterOpen,
  value,
  onChange,
  isFilterActive,
  disableFilter = false,
  placeholderText,
  className = '',
}) {
  const classes = useStyles();
  return (
    <>
      <div className={clsx(classes.container, className)}>
        <Input
          isSearchBar
          classes={{ container: { flexGrow: 1 } }}
          value={value}
          onChange={onChange}
          placeholder={placeholderText}
        />
        {!disableFilter && <FilterButton isFilterActive={isFilterActive} onClick={onFilterOpen} />}
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
  placeholderText: PropTypes.string, // if not supplied, isSearchbar default is common:SEARCH
  className: PropTypes.string,
};
