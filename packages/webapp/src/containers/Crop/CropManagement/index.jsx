import { useDispatch, useSelector } from 'react-redux';
import PureCropManagement from '../../../components/Crop/Management';
import { cropVarietySelector } from '../../cropVarietySlice';
import CropVarietySpotlight from '../CropVarietySpotlight';
import RepeatedCropPlanSpotlight from '../RepeatedCropPlanSpotlight';
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
import { useManagementPlanCardContents } from './useManagementPlanCardContents';
import { useEffect } from 'react';
import { getManagementPlans } from '../../saga';
import { getTasks, getTaskTypes } from '../../Task/saga';
import { isAdminSelector } from '../../userFarmSlice';

const seedingTypeIsSeedMap = {
  SEED: true,
  SEEDLING_OR_PLANTING_STOCK: false,
};

function CropManagement({ history, match, location }) {
  const dispatch = useDispatch();
  const variety_id = match.params.variety_id;
  const selectedVariety = useSelector(cropVarietySelector(variety_id));

  const managementPlanCardContents = useManagementPlanCardContents(variety_id);
  const goBack = () => {
    history.push(location?.state?.returnPath ?? `/crop_varieties/crop/${selectedVariety.crop_id}`);
  };
  const onAddManagementPlan = () => {
    const estimated_seeds_unit = { value: 'kg', label: 'kg' };
    dispatch(
      setFormData({
        crop_management_plan: {
          for_cover: selectedVariety.can_be_cover_crop ? undefined : false,
          is_seed: seedingTypeIsSeedMap[selectedVariety.seeding_type],
          needs_transplant: selectedVariety.needs_transplant,

          planting_management_plans: {
            final: {
              estimated_seeds_unit,
              planting_method: selectedVariety.planting_method,
              bed_method: {
                plant_spacing: selectedVariety.plant_spacing,
                planting_depth: selectedVariety.planting_depth,
              },
              row_method: {
                plant_spacing: selectedVariety.plant_spacing,
                planting_depth: selectedVariety.planting_depth,
              },
              broadcast_method: { seeding_rate: selectedVariety.seeding_rate },
              container_method: { planting_depth: selectedVariety.planting_depth },
            },
            initial: { estimated_seeds_unit },
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

  useEffect(() => {
    dispatch(getTaskTypes());
    dispatch(getManagementPlans());
    dispatch(getTasks());
  }, []);

  const hasRepeatingPlans = !!managementPlanCardContents.find((plan) => !!plan.repetition_count);

  const isAdmin = useSelector(isAdminSelector);
  return (
    <CropVarietySpotlight>
      <PureCropManagement
        history={history}
        variety={selectedVariety}
        match={match}
        onBack={goBack}
        onAddManagementPlan={onAddManagementPlan}
        managementPlanCardContents={managementPlanCardContents}
        isAdmin={isAdmin}
        location={location}
      />
      <RepeatedCropPlanSpotlight
        repeatingPlanCreated={hasRepeatingPlans}
      ></RepeatedCropPlanSpotlight>
    </CropVarietySpotlight>
  );
}

export default CropManagement;
