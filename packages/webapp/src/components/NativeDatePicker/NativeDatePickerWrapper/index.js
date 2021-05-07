import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  dateContainer: {
    position: 'relative',
    display: 'inline',
  },
  input: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    minWidth: '10px',
    opacity: 0,
    '&::-webkit-calendar-picker-indicator': {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: 'auto',
      transform: 'translateX(-27px)',
    },
  },
});
export default function NativeDatePickerWrapper({ children, className, style, ...props }) {
  const classes = useStyles();
  return (
    <div className={className} style={style}>
      <div className={classes.dateContainer}>
        <input type={'date'} size={1} className={classes.input} {...props} />
        {children}
      </div>
    </div>
  );
}
