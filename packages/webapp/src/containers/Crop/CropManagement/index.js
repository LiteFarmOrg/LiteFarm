import { useDispatch, useSelector } from 'react-redux';
import PureCropManagement from '../../../components/Crop/management';
import { cropVarietySelector } from '../../cropVarietySlice';
import CropVarietySpotlight from '../CropVarietySpotlight';
import { currentAndPlannedManagementPlansByCropVarietySelector } from '../../managementPlanSlice';
import {
  setFormData,
  setPersistedPaths,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';

function CropManagement({ history, match }) {
  const dispatch = useDispatch();
  const selectedVariety = useSelector(cropVarietySelector(match.params.variety_id));
  const currentManagementPlans = useSelector(
    currentAndPlannedManagementPlansByCropVarietySelector(match.params.variety_id),
  );
  const goBack = () => {
    history.push(`/crop_varieties/crop/${selectedVariety.crop_id}`);
  };
  const onAddManagementPlan = () => {
    dispatch(
      setFormData({
        crop_management_plan: {
          for_cover: selectedVariety.can_be_cover_crop ? undefined : false,
          is_seed: selectedVariety.is_seed,
          germination_days: selectedVariety.germination_days,
          transplant_days: selectedVariety.transplant_days,
          harvest_days: selectedVariety.harvest_days,
          termination_days: selectedVariety.termination_days,
          planting_management_plans: {
            final: { estimated_yield_unit: 'kg' },
            initial: { estimated_yield_unit: 'kg' },
          },
        },
      }),
    );
    dispatch(
      setPersistedPaths([
        `/crop/${match.params.variety_id}/add_management_plan/planted_already`,
        `/crop/${match.params.variety_id}/add_management_plan/needs_transplant`,
        `/crop/${match.params.variety_id}/add_management_plan/next_harvest`,
        `/crop/${match.params.variety_id}/add_management_plan/plant_date`,
        `/crop/${match.params.variety_id}/add_management_plan/choose_initial_planting_location`,
        `/crop/${match.params.variety_id}/add_management_plan/choose_final_planting_location`,
        `/crop/${match.params.variety_id}/add_management_plan/final_planting_method`,
        `/crop/${match.params.variety_id}/add_management_plan/initial_planting_method`,
        `/crop/${match.params.variety_id}/add_management_plan/initial_container_method`,
        `/crop/${match.params.variety_id}/add_management_plan/historical_broadcast_method`,
        `/crop/${match.params.variety_id}/add_management_plan/historical_container_method`,
        `/crop/${match.params.variety_id}/add_management_plan/historical_bed_method`,
        `/crop/${match.params.variety_id}/add_management_plan/historical_bed_guidance`,
        `/crop/${match.params.variety_id}/add_management_plan/historical_row_method`,
        `/crop/${match.params.variety_id}/add_management_plan/historical_row_guidance`,
        `/crop/${match.params.variety_id}/add_management_plan/broadcast_method`,
        `/crop/${match.params.variety_id}/add_management_plan/container_method`,
        `/crop/${match.params.variety_id}/add_management_plan/bed_method`,
        `/crop/${match.params.variety_id}/add_management_plan/bed_guidance`,
        `/crop/${match.params.variety_id}/add_management_plan/row_method`,
        `/crop/${match.params.variety_id}/add_management_plan/row_guidance`,
        `/crop/${match.params.variety_id}/add_management_plan/name`,
      ]),
    );
    history.push(`/crop/${match.params.variety_id}/add_management_plan/planted_already`);
  };
  return (
    <>
      <PureCropManagement
        history={history}
        variety={selectedVariety}
        match={match}
        onBack={goBack}
        onAddManagementPlan={onAddManagementPlan}
      />
      <CropVarietySpotlight />
    </>
  );
}

export default CropManagement;
