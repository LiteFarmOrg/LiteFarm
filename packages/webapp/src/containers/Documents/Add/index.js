import React, { useEffect } from 'react';
import PureAddDocumentView from '../../../components/Documents/Add';
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
    //   thumbnailUrl: 'https://litefarmbeta.nyc3.digitaloceanspaces.com/default_crop/default.jpg'
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

  const upload = () => {
    //TODO: uploading functionality tbd
  };

  const deleteImage = (url) => {
    dispatch(deleteUploadedFile({ thumbnailUrl: url }));
  };

  return (
    <PureAddDocumentView
      onCancel={onCancel}
      onGoBack={onBack}
      submit={handleSubmit}
      uploadImageOrDocument={upload}
      deleteImage={deleteImage}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default AddDocument;
