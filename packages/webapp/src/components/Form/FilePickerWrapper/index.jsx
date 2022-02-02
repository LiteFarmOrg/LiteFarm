import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
  inputContainer: {
    position: 'relative',
    display: 'inline',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    minWidth: '10px',
    opacity: 0,
    cursor: 'pointer',
    '&::-webkit-file-upload-button': {
      cursor: 'pointer',
    },
  },
});

export default function PureFilePickerWrapper({
  children,
  className,
  style,
  disabled,
  onChange,
  ...props
}) {
  const classes = useStyles();

  return (
    <div className={className} style={style}>
      <div className={classes.inputContainer}>
        <input
          type={'file'}
          size={1}
          className={classes.input}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        {children}
      </div>
    </div>
  );
}

PureFilePickerWrapper.propTypes = {
  disabled: PropTypes.bool,
  style: PropTypes.object,
  onChange: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.object,
};
