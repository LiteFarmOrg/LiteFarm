import PureFilePickerWrapper from '../../../components/Form/FilePickerWrapper';
import { AddLink } from '../../../components/Typography';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { uploadDocument } from './saga';
import { useState } from 'react';
import FileSizeExceedModal from '../../../components/Modals/FileSizeExceedModal';

export function DocumentUploader({ style, onUpload }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const onChange = (e) => {
    if (e?.target?.files?.[0].size > 26214400) {
      setShowErrorModal(true);
    } else if (e?.target?.files?.[0]) {
      onUpload?.();
      dispatch(uploadDocument(e.target.files[0]));
      // TODO - Add path
      console.log("Go to Add Document page");
    }
  };

  return (
    <>
      <PureFilePickerWrapper onChange={onChange} style={style}>
        <AddLink style={style}>{t('DOCUMENTS.ADD_DOCUMENT')}</AddLink>
      </PureFilePickerWrapper>
      {showErrorModal && (
        <FileSizeExceedModal
          dismissModal={() => {setShowErrorModal(false)}}
          handleRetry={() =>  {setShowErrorModal(false)}}
        />
      )}
    </>
  );
}

DocumentUploader.propTypes = {
  style: PropTypes.object,
  onUpload: PropTypes.func,
};
