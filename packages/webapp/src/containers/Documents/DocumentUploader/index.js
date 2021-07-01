import PureFilePickerWrapper from '../../../components/Form/FilePickerWrapper';
import { AddLink } from '../../../components/Typography';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { uploadDocument } from './saga';
import { useState } from 'react';
import FileSizeExceedModal from '../../../components/Modals/FileSizeExceedModal';
import { toastr } from 'react-redux-toastr';
import i18n from '../../../locales/i18n';

export function DocumentUploader({ style, linkstyle, onUpload, linkText, onUploadEnd }) {
  const dispatch = useDispatch();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const onChange = (e) => {
    const file = e?.target?.files?.[0];
    if (!isValidFile(file)) {
      toastr.error(i18n.t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD'));
    } else if (e?.target?.files?.[0]?.size > 26214400) {
      setShowErrorModal(true);
    } else if (e?.target?.files?.[0]) {
      onUpload?.();
      dispatch(uploadDocument({ file: e.target.files[0], onUploadEnd }));
    }
  };

  return (
    <>
      <PureFilePickerWrapper
        onChange={onChange}
        style={style}
        accept={`image/*,${allowedDocumentFormatArray.join(',')}`}
      >
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
const allowedDocumentFormatArray = [
  '.cvs',
  '.doc',
  '.docb',
  '.docm',
  '.docx',
  '.dot',
  '.dotm',
  '.dotx',
  '.txt',
  '.xls',
  '.xlsx',
  '.pdf',
];
const allowedDocumentFormatSet = new Set(allowedDocumentFormatArray);

function isImageOrPdf(file) {
  return file?.type === 'application/pdf' || /^image\/.*/.test(file?.type);
}

function isValidFile(file) {
  return isImageOrPdf(file) || allowedDocumentFormatSet.has(`.${file?.name?.split('.')?.pop?.()}`);
}
