import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch } from 'react-redux';
import { deleteUploadedFile } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { postDocument } from '../saga';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { MediaWithAuthentication } from '../../../containers/MediaWithAuthentication';
import { DocumentUploader } from '../DocumentUploader';
import { useNavigate } from 'react-router-dom-v5-compat';

function AddDocument() {
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (data) => {
    dispatch(postDocument(data));
  };

  const onBack = () => {
    navigate(-1);
  };

  const deleteImage = (url) => {
    dispatch(deleteUploadedFile({ url }));
  };

  return (
    <PureDocumentDetailView
      onGoBack={onBack}
      submit={handleSubmit}
      deleteImage={deleteImage}
      useHookFormPersist={useHookFormPersist}
      imageComponent={(props) => <MediaWithAuthentication {...props} />}
      documentUploader={(props) => <DocumentUploader {...props} />}
      isEdit={false}
      persistedPath={[]}
    />
  );
}

export default AddDocument;
