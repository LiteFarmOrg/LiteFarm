import PureFilePickerWrapper from '../../../components/Form/FilePickerWrapper';
import { AddLink } from '../../../components/Typography';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { uploadDocument } from './saga';
import { useState } from 'react';
import FileSizeExceedModal from '../../../components/Modals/FileSizeExceedModal';

export function DocumentUploader({ style, linkstyle, onUpload, linkText, onUploadEnd }) {
  const dispatch = useDispatch();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const onChange = (e) => {
    if (e?.target?.files?.[0]?.size > 26214400) {
      setShowErrorModal(true);
    } else if (e?.target?.files?.[0]) {
      onUpload?.();
      dispatch(uploadDocument({ file: e.target.files[0], onUploadEnd }));
    }
  };

  return (
    <>
      <PureFilePickerWrapper onChange={onChange} style={style} accept={'application/pdf,image/*'}>
        <AddLink style={linkstyle}>{linkText}</AddLink>
      </PureFilePickerWrapper>
      {showErrorModal && (
        <FileSizeExceedModal
          dismissModal={() => {
            setShowErrorModal(false);
          }}
          handleRetry={() => {
            setShowErrorModal(false);
          }}
        />
      )}
    </>
  );
}

DocumentUploader.propTypes = {
  style: PropTypes.object,
  onUpload: PropTypes.func,
};
