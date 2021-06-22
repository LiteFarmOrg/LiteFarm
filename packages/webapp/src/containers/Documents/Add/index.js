import React, { useEffect } from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch } from 'react-redux';
import { deleteUploadedFile } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { postDocument } from '../saga';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';

function AddDocument({ history }) {
  const dispatch = useDispatch();

  const handleSubmit = (data) => {
    console.log(data);
    dispatch(postDocument(data));
  };

  const onBack = () => {
    onCancel();
  };

  const onCancel = () => {
    history.push('/documents');
  };

  const deleteImage = (url) => {
    dispatch(deleteUploadedFile({ thumbnail_url: url }));
  };

  return (
    <PureDocumentDetailView
      onCancel={onCancel}
      onGoBack={onBack}
      submit={handleSubmit}
      deleteImage={deleteImage}
      useHookFormPersist={useHookFormPersist}
      imageComponent={ImageWithAuthentication}
      isEdit={false}
      persistedPath={[]}
    />
  );
}

export default AddDocument;
