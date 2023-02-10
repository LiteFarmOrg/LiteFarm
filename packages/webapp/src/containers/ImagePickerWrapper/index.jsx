import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import { useRef } from 'react';
import { mergeRefs } from '../../components/Form/utils';
import PropTypes from 'prop-types';
import { uploadImage } from './saga';
import i18n from '../../locales/i18n';
import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';

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
  uploadDirectory, //deprecated but supported for storybook
  targetRoute,
  compressorProps = {},
  ...props
}) {
  const classes = useStyles();
  const input = useRef();
  const name = hookFormRegister?.name ?? props?.name;
  const dispatch = useDispatch();
  const onFileUpload = async (e) => {
    if (e?.target?.files?.[0]) {
      const blob = e.target.files[0];
      const isNotImage = !/^image\/.*/.test(blob.type);
      if (isNotImage) {
        dispatch(enqueueErrorSnackbar(i18n.t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD')));
      } else if (blob.size < 200000) {
        dispatch(
          uploadImage({ file: blob, onUploadSuccess, targetRoute: targetRoute ?? uploadDirectory }),
        );
      } else {
        const Compressor = await import('compressorjs').then((Compressor) => Compressor.default);
        new Compressor(blob, {
          quality: blob.size > 1000000 ? 0.6 : 0.8,
          convertSize: 200000,
          success(compressedBlob) {
            dispatch(
              uploadImage({
                file: compressedBlob,
                onUploadSuccess,
                targetRoute: targetRoute ?? uploadDirectory,
              }),
            );
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
          multiple={true}
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
  targetRoute: PropTypes.string,
  compressorProps: PropTypes.object,
};
