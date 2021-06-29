import React, { useEffect } from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteUploadedFile,
  hookFormPersistSelector,
  initEditDocument,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';
import { documentSelector } from '../../documentSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { DocumentUploader } from '../DocumentUploader';

export default function EditDocument({ history, match }) {
  const dispatch = useDispatch();
  const { document_id } = match.params;

  const document = useSelector(documentSelector(document_id));
  const { uploadedFiles } = useSelector(hookFormPersistSelector);
  useEffect(() => {
    if (!uploadedFiles) {
      dispatch(initEditDocument(document.files));
    }
  }, []);
  const onGoBack = () => {
    history.push(`/documents/${document_id}`);
  };

  const onSubmit = (data) => {
    // TODO - Add functionality to PATCH
    console.log('Patch data to document');
  };

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
        imageComponent={(props) => <ImageWithAuthentication {...props} />}
        documentUploader={(props) => <DocumentUploader {...props} />}
      />
    </>
  );
}
