import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
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

export default function EditDocument() {
  const history = useHistory();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { document_id } = useParams();

  const document = useSelector(documentSelector(document_id));
  const { uploadedFiles } = useSelector(hookFormPersistSelector);

  useEffect(() => {
    if (!uploadedFiles) {
      dispatch(initEditDocument(document.files));
    }
  }, []);
  const onGoBack = () => {
    navigate(-1);
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
