import React, { useEffect } from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch } from 'react-redux';
import { deleteUploadedFile } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { postDocumentSaga } from '../saga';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function AddDocument({ history }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Just to see images.
    // dispatch(uploadFileSuccess([{
    //   url: 'https://litefarmbeta.nyc3.digitaloceanspaces.com/default_crop/default.jpg',
    //   thumbnail_url: 'https://litefarmbeta.nyc3.digitaloceanspaces.com/default_crop/default.jpg'
    // }]))
  }, []);

  const handleSubmit = (data) => {
    dispatch(postDocumentSaga(data));
  };

  const onBack = () => {
    onCancel();
  };

  const onCancel = () => {
    history.push('/document');
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
      isEdit={false}
    />
  );
}

export default AddDocument;
