import { useEffect } from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch, useSelector } from 'react-redux';
import {
  hookFormPersistSelector,
  initEditDocument,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { documentSelector } from '../../documentSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

import { updateDocument } from '../saga';
import useFilePickerUpload from '../../../components/FilePicker/useFilePickerUpload';

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

  const { isUploading, ...filePickerFunctions } = useFilePickerUpload();

  return (
    <>
      <PureDocumentDetailView
        onGoBack={onGoBack}
        submit={onSubmit}
        isEdit={true}
        persistedFormData={document}
        useHookFormPersist={useHookFormPersist}
        isUploading={isUploading}
        filePickerFunctions={filePickerFunctions}
      />
    </>
  );
}
