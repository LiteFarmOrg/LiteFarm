import PureEditManagementPlanDetail from '../../../components/Crop/ManagementDetail/EditManagementPlanDetail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { managementPlanSelector } from '../../managementPlanSlice';
import { measurementSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import FirstManagementPlanSpotlight from './FirstManagementPlanSpotlight';
import { patchManagementPlan } from '../saga';
import { getProcessedFormData } from '../../hooks/useHookFormPersist/utils';
import produce from 'immer';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function ManagementDetails() {
  let navigate = useNavigate();
  let location = useLocation();
  const dispatch = useDispatch();
  let { variety_id, management_plan_id } = useParams();
  const variety = useSelector(cropVarietySelector(variety_id));
  const plan = useSelector(managementPlanSelector(management_plan_id));

  useEffect(() => {
    if (!plan || plan.deleted) {
      navigate(`/crop/${variety_id}/management`, { replace: true });
    }
  }, [plan, navigate]);

  const onBack = () => {
    navigate(`/crop/${variety_id}/management_plan/${management_plan_id}/details`);
  };

  const showSpotlight = location.state?.fromCreation;

  const system = useSelector(measurementSelector);
  const onSubmit = (data) => {
    const managementPlan = produce(data, (data) => {
      data.management_plan_id = management_plan_id;
      data.crop_management_plan &&
        (data.crop_management_plan.management_plan_id = management_plan_id);
      data.crop_variety_id = variety_id;
      data.harvested_to_date = plan.harvested_to_date;
    });
    dispatch(patchManagementPlan(getProcessedFormData(managementPlan)));
  };
  return (
    <>
      <PureEditManagementPlanDetail
        onBack={onBack}
        variety={variety}
        plan={plan}
        system={system}
        onSubmit={onSubmit}
      />
      {showSpotlight && <FirstManagementPlanSpotlight />}
    </>
  );
}
