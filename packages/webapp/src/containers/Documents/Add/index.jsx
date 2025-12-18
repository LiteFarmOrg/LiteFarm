import { useHistory } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch } from 'react-redux';
import { postDocument } from '../saga';
import useHookFormPersist from '../../hooks/useHookFormPersist';

import useFilePickerUpload from '../../../components/FilePicker/useFilePickerUpload';

function AddDocument() {
  const history = useHistory();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (data) => {
    dispatch(postDocument(data));
  };

  const onBack = () => {
    navigate(-1);
  };

  const { isUploading, ...filePickerFunctions } = useFilePickerUpload();

  return (
    <PureDocumentDetailView
      onGoBack={onBack}
      submit={handleSubmit}
      filePickerFunctions={filePickerFunctions}
      isUploading={isUploading}
      useHookFormPersist={useHookFormPersist}
      isEdit={false}
      persistedPath={[]}
    />
  );
}

export default AddDocument;
