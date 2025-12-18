import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import produce from 'immer';
import PureUpdateEstimatedCropRevenue from '../../../components/Finances/UpdateEstimatedCropRevenue';
import { managementPlanSelector } from '../../managementPlanSlice';
import { measurementSelector } from '../../userFarmSlice';
import { getProcessedFormData } from '../../hooks/useHookFormPersist/utils';
import { patchEstimatedCropRevenue } from '../saga';

function UpdateEstimatedCropRevenue() {
  const navigate = useNavigate();
  const { management_plan_id } = useParams();
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const managementPlan = useSelector(managementPlanSelector(management_plan_id));
  const system = useSelector(measurementSelector);

  const { crop_variety_id } = managementPlan;

  const onSubmit = (data) => {
    const managementPlan = produce(data, (data) => {
      data.management_plan_id = management_plan_id;
      data.crop_management_plan &&
        (data.crop_management_plan.management_plan_id = management_plan_id);
      data.crop_variety_id = crop_variety_id;
    });
    dispatch(patchEstimatedCropRevenue(getProcessedFormData(managementPlan)));
  };

  return (
    <PureUpdateEstimatedCropRevenue
      system={system}
      managementPlan={managementPlan}
      onGoBack={() => navigate(-1)}
      onSubmit={onSubmit}
    />
  );
}

export default UpdateEstimatedCropRevenue;
