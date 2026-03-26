import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { ComponentPropsWithoutRef } from 'react';

const useStyles = makeStyles({
  inputContainer: {
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer',
  },
  inputContainerFullWidth: {
    display: 'block',
    width: '100%',
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
  fullWidth = false,
  onChange,
  ...props
}: ComponentPropsWithoutRef<'input'> & { fullWidth?: boolean }) {
  const classes = useStyles();
  const inputContainerClassName = [
    classes.inputContainer,
    fullWidth ? classes.inputContainerFullWidth : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} style={style}>
      <div className={inputContainerClassName}>
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
  fullWidth: PropTypes.bool,
  style: PropTypes.object,
  onChange: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};
