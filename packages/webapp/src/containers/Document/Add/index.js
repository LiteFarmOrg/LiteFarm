import React from 'react';
import PureAddDocumentView from '../../../components/Documents/Add';


function AddDocument({ history }) {

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