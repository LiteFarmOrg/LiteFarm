import { useDispatch, useSelector } from 'react-redux';
import PureCropManagement from '../../../components/Crop/management';
import { cropVarietySelector } from '../../cropVarietySlice';
import CropVarietySpotlight from '../CropVarietySpotlight';
import { currentAndPlannedManagementPlansByCropVarietySelector } from '../../managementPlanSlice';
import {
  setFormData,
  setPersistedPaths,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import {
  addManagementPlanNamePath,
  finalBedGuidancePath,
  finalBedPath,
  finalBroadcastPath,
  finalContainerPath,
  finalLocationPath,
  finalPlantingMethodPath,
  finalRowGuidancePath,
  finalRowPath,
  initialBedGuidancePath,
  initialBedPath,
  initialBroadcastPath,
  initialContainerPath,
  initialLocationPath,
  initialPlantingMethodPath,
  initialRowGuidancePath,
  initialRowPath,
  needsTransplantPath,
  plantedAlreadyPath,
  plantingDatePath,
} from '../../../components/Crop/addManagementPlanPaths';

function CropManagement({ history, match }) {
  const dispatch = useDispatch();
  const variety_id = match.params.variety_id;
  const selectedVariety = useSelector(cropVarietySelector(variety_id));
  const currentManagementPlans = useSelector(
    currentAndPlannedManagementPlansByCropVarietySelector(variety_id),
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
        plantedAlreadyPath(variety_id),
        needsTransplantPath(variety_id),
        plantingDatePath(variety_id),
        initialLocationPath(variety_id),
        finalLocationPath(variety_id),
        finalPlantingMethodPath(variety_id),
        initialPlantingMethodPath(variety_id),
        initialBroadcastPath(variety_id),
        initialContainerPath(variety_id),
        initialBedPath(variety_id),
        initialBedGuidancePath(variety_id),
        initialRowPath(variety_id),
        initialRowGuidancePath(variety_id),
        finalBroadcastPath(variety_id),
        finalContainerPath(variety_id),
        finalBedPath(variety_id),
        finalBedGuidancePath(variety_id),
        finalRowPath(variety_id),
        finalRowGuidancePath(variety_id),
        addManagementPlanNamePath(variety_id),
      ]),
    );
    history.push(plantedAlreadyPath(variety_id));
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
