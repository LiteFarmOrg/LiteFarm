import React, { useEffect } from 'react';
import PureAddDocumentView from '../../../components/Documents/Add';
import { useDispatch } from 'react-redux';
import { uploadFileSuccess } from '../../documentSlice';


function AddDocument({ history }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(uploadFileSuccess([{
      url: 'https://litefarmbeta.nyc3.digitaloceanspaces.com/default_crop/default.jpg',
      thumbnailUrl: 'https://litefarmbeta.nyc3.digitaloceanspaces.com/default_crop/default.jpg'
    }]))
  },[]);

  const handleSubmit = (data) => {

  }

  const onBack = () => {

  }

  const onCancel = () => {
    history.push('/document')
  }

  const upload = () => {

  }

  return (
    <PureAddDocumentView
      onCancel={onCancel}
      onGoBack={onBack}
      submit={handleSubmit}
      uploadImageOrDocument={upload}
    />
  )
}



export default AddDocument;