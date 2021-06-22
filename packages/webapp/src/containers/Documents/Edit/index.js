import React from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useDispatch } from 'react-redux';
import { deleteUploadedFile } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';

export default function EditDocument({ history, match }) {
  const dispatch = useDispatch();
  const { document_id } = match.params;

  const onGoBack = () => {
    history.push(`/documents/${document_id}`);
  };

  const onSubmit = () => {
    // TODO - Add functionality to PATCH
    console.log("Patch data to document");
  }

  const deleteImage = (url) => {
    dispatch(deleteUploadedFile({ thumbnail_url: url }));
  };

  return (
    <>
      <HookFormPersistProvider>
        <PureDocumentDetailView
          onGoBack={onGoBack}
          submit={onSubmit}
          deleteImage={deleteImage}
          isEdit={true}
          imageComponent={ImageWithAuthentication}
        />
      </HookFormPersistProvider>
    </>
  );
};