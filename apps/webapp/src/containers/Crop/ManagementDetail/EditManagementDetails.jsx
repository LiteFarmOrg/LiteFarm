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

export default function ManagementDetails({ history, match }) {
  const dispatch = useDispatch();
  const variety_id = match.params.variety_id;
  const variety = useSelector(cropVarietySelector(variety_id));

  const management_plan_id = match.params.management_plan_id;
  const plan = useSelector(managementPlanSelector(management_plan_id));

  useEffect(() => {
    if (plan === undefined) {
      history.replace(`/crop/${variety_id}/management`);
    }
  }, [plan, history]);

  const onBack = () => {
    history.push(`/crop/${variety_id}/management_plan/${match.params.management_plan_id}/details`);
  };

  const showSpotlight = history.location.state?.fromCreation;

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
