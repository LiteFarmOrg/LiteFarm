import React from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useDispatch } from 'react-redux';
import { deleteUploadedFile } from '../../hooks/useHookFormPersist/hookFormPersistSlice';

export default function EditDocument({ history, match }) {
  const dispatch = useDispatch();

  const onGoBack = () => {
    console.log('Go back to view(LF-1430)');
  };

  const onSubmit = () => {
    // TODO - Add functionality to PATCH
    console.log('Patch data to document');
  };

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
        />
      </HookFormPersistProvider>
    </>
  );
}
