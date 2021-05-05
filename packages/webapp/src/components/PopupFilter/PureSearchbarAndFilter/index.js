import { FiFilter } from 'react-icons/all';
import Input from '../../Form/Input';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    gap: '16px',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    right: 0,
    width: '4px',
    height: '4px',
    borderRadius: '2px',
    color: colors.teal700,
  },
  filter: {},
});

export default function PureSearchbarAndFilter({ filterOptions }) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.container}>
        <Input isSearchBar />
        <span className={classes.circle} />
        <FiFilter className={classes.filter} />
      </div>
      {filterOptions && filterOptions.map((option, key) => {})}
    </>
  );
}
