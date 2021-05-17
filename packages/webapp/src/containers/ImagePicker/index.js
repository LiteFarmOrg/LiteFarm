import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  inputContainer: {
    position: 'relative',
    display: 'inline',
  },
  input: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    minWidth: '10px',
    opacity: 0,
  },
});
export default function ImagePicker({ children, className, style, ...props }) {
  const classes = useStyles();
  return (
    <div className={className} style={style}>
      <div className={classes.inputContainer}>
        <input type={'file'} accept="image/*" size={1} className={classes.input} {...props} />
        {children}
      </div>
    </div>
  );
}
