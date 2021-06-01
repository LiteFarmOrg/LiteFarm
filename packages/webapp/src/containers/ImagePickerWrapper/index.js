import { makeStyles } from '@material-ui/core/styles';
import uploadFile, { digestMessage } from '../../util/uploadFile';
import { useSelector } from 'react-redux';
import { loginSelector } from '../userFarmSlice';
import Compressor from 'compressorjs';
import { useRef } from 'react';
import { mergeRefs } from '../../components/Form/utils';
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

export default function ImagePickerWrapper({
  children,
  className,
  style,
  disabled,
  hookFormRegister,
  onChange,
  onBlur,
  uploadDirectory,
  compressorProps = {},
  ...props
}) {
  const classes = useStyles();
  const { user_id } = useSelector(loginSelector);
  const input = useRef();
  const name = hookFormRegister?.name ?? props?.name;
  const onFileUpload = async (e) => {
    if (e?.target?.files?.[0]) {
      const blob = e.target.files[0];
      const hash = await digestMessage(`${user_id}${new Date().getTime().toString()}`);
      if (blob.size < 200000) {
        uploadFile(blob, `crop/${hash}`, onUploadSuccess, { isPublic: true });
      } else {
        new Compressor(blob, {
          quality: blob.size > 1000000 ? 0.6 : 0.8,
          convertSize: 200000,
          success(compressedBlob) {
            uploadFile(compressedBlob, `${uploadDirectory}${hash}`, onUploadSuccess, {
              isPublic: true,
            });
          },
          error(err) {
            console.log(err.message);
          },
          ...compressorProps,
        });
      }
    }
  };
  const onUploadSuccess = (url) => {
    input.current.value = url;
    onChange?.({ target: input.current });
    hookFormRegister?.onChange({ target: input.current });
  };
  return (
    <div className={className} style={style}>
      <div className={classes.inputContainer}>
        <input
          style={{ display: 'none' }}
          type={'text'}
          disabled={disabled}
          ref={mergeRefs(hookFormRegister?.ref, input)}
          name={name}
          onChange={(e) => {
            onChange?.(e);
            hookFormRegister?.onChange?.(e);
          }}
          onBlur={(e) => {
            onBlur?.(e);
            hookFormRegister?.onBlur?.(e);
          }}
        />
        <input
          type={'file'}
          accept="image/*"
          size={1}
          className={classes.input}
          onChange={onFileUpload}
          disabled={disabled}
        />
        {children}
      </div>
    </div>
  );
}

ImagePickerWrapper.propTypes = {
  disabled: PropTypes.bool,
  style: PropTypes.object,
  name: PropTypes.string,
  hookFormRegister: PropTypes.exact({
    ref: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    name: PropTypes.string,
  }),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.object,
  uploadDirectory: PropTypes.string,
  compressorProps: PropTypes.object,
};
