import ComplianceInfo from '../../components/AddCropVariety/ComplianceInfo';
import { useDispatch, useSelector } from 'react-redux';
import { postCropAndVarietal, postVarietal } from './saga';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { HookFormPersistProvider } from '../hooks/useHookFormPersist/HookFormPersistProvider';
import { cropSelector } from '../cropSlice';
import { useNavigate, useParams } from 'react-router-dom';

function ComplianceInfoForm() {
  let navigate = useNavigate();
  //TODO: create two different route for creating crop / crop_variety
  let { crop_id } = useParams();
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);

  const crop = useSelector(cropSelector(crop_id));
  const isNewCrop = crop_id === 'new';

  const onError = (err) => {
    console.log(err);
  };

  const onSubmit = (data) => {
    const cropData = {
      ...persistedFormData,
      ...data,
      hs_code_id: data.hs_code_id || undefined,
      compliance_file_url: '',
    };
    if (isNewCrop) {
      dispatch(postCropAndVarietal(cropData));
    } else {
      dispatch(postVarietal({ ...cropData, crop_id: Number(crop_id) }));
    }
  };

  const onGoBack = () => {
    navigate(-1);
  };

  return (
    <HookFormPersistProvider>
      <ComplianceInfo onSubmit={onSubmit} onError={onError} onGoBack={onGoBack} crop={crop} />
    </HookFormPersistProvider>
  );
}

export default ComplianceInfoForm;
