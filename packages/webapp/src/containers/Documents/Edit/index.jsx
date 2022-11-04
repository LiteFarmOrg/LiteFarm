import React, { useEffect } from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteUploadedFile,
  hookFormPersistSelector,
  initEditDocument,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { MediaWithAuthentication } from '../../../containers/MediaWithAuthentication';
import { documentSelector } from '../../documentSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { DocumentUploader } from '../DocumentUploader';
import { updateDocument } from '../saga';

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
    history.back();
  };

  const onSubmit = (data) => {
    dispatch(
      updateDocument({
        document_id: document_id,
        documentData: data,
      }),
    );
  };

  const deleteImage = (url) => {
    dispatch(deleteUploadedFile({ url }));
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
        imageComponent={(props) => <MediaWithAuthentication {...props} />}
        documentUploader={(props) => <DocumentUploader {...props} />}
      />
    </>
  );
}
