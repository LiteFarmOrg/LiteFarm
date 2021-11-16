import React from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch } from 'react-redux';
import { deleteUploadedFile } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { postDocument } from '../saga';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';
import { DocumentUploader } from '../DocumentUploader';

function AddDocument({ history }) {
  const dispatch = useDispatch();

  const handleSubmit = (data) => {
    dispatch(postDocument(data));
  };

  const onBack = () => {
    onCancel();
  };

  const onCancel = () => {
    history.push('/documents');
  };

  const deleteImage = (url) => {
    dispatch(deleteUploadedFile({ url }));
  };

  return (
    <PureDocumentDetailView
      onCancel={onCancel}
      onGoBack={onBack}
      submit={handleSubmit}
      deleteImage={deleteImage}
      useHookFormPersist={useHookFormPersist}
      imageComponent={(props) => <ImageWithAuthentication {...props} />}
      documentUploader={(props) => <DocumentUploader {...props} />}
      isEdit={false}
      persistedPath={[]}
    />
  );
}

export default AddDocument;
