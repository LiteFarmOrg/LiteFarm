import React from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUploadedFile } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';
import { documentSelector } from '../../documentSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

export default function EditDocument({ history, match }) {
  const dispatch = useDispatch();
  const { document_id } = match.params;

  const document = useSelector(documentSelector(document_id));
  //document.type={ label: 'Cleaning product', value: 'CLEANING_PRODUCT' };

  const onGoBack = () => {
    history.push(`/documents/${document_id}`);
  };

  const onSubmit = (data) => {
    // TODO - Add functionality to PATCH
    console.log("Patch data to document");
    console.log(data);
  }

  const deleteImage = (url) => {
    dispatch(deleteUploadedFile({ thumbnail_url: url }));
  };

  return (
    <>
      <PureDocumentDetailView
        onGoBack={onGoBack}
        submit={onSubmit}
        deleteImage={deleteImage}
        isEdit={true}
        persistedFormData={document}
        useHookFormPersist={useHookFormPersist}
        imageComponent={ImageWithAuthentication}
      />
    </>
  );
}
