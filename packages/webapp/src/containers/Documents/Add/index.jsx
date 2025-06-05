import React from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch } from 'react-redux';
import { deleteUploadedFile } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { postDocument } from '../saga';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { MediaWithAuthentication } from '../../../containers/MediaWithAuthentication';
import { DocumentUploader } from '../DocumentUploader';
import useFilePickerUpload from '../../../components/FilePicker/useFilePickerUpload';

function AddDocument({ history }) {
  const dispatch = useDispatch();

  const handleSubmit = (data) => {
    dispatch(postDocument(data));
  };

  const onBack = () => {
    history.back();
  };

  const { isFirstFileUpdateEnded, ...filePickerFunctions } = useFilePickerUpload();

  return (
    <PureDocumentDetailView
      onGoBack={onBack}
      submit={handleSubmit}
      filePickerFunctions={filePickerFunctions}
      isFirstFileUpdateEnded={isFirstFileUpdateEnded}
      useHookFormPersist={useHookFormPersist}
      isEdit={false}
      persistedPath={[]}
    />
  );
}

export default AddDocument;
