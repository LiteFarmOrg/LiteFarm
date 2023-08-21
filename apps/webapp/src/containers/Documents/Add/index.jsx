import React from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch } from 'react-redux';
import { deleteUploadedFile } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { postDocument } from '../saga';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { MediaWithAuthentication } from '../../../containers/MediaWithAuthentication';
import { DocumentUploader } from '../DocumentUploader';

function AddDocument({ history }) {
  const dispatch = useDispatch();

  const handleSubmit = (data) => {
    dispatch(postDocument(data));
  };

  const onBack = () => {
    history.back();
  };

  const deleteImage = (url) => {
    dispatch(deleteUploadedFile({ url }));
  };

  return (
    <PureDocumentDetailView
      onGoBack={onBack}
      submit={handleSubmit}
      deleteImage={deleteImage}
      useHookFormPersist={useHookFormPersist}
      imageComponent={(props) => <MediaWithAuthentication {...props} />}
      documentUploader={(props) => <DocumentUploader {...props} />}
      isEdit={false}
      persistedPath={[]}
    />
  );
}

export default AddDocument;
