import {
  getCurrentManagementPlans,
  getAbandonedManagementPlans,
  getCompletedManagementPlans,
  getPlannedManagementPlans,
} from '../managementPlanSlice';
import { useSelector } from 'react-redux';
import { cropCatalogueFilterDateSelector, cropVarietyFilterSelector } from '../filterSlice';
import { useMemo } from 'react';
import useStringFilteredCrops from '../CropCatalogue/useStringFilteredCrops';
import {
  ACTIVE,
  ABANDONED,
  COMPLETE,
  LOCATION,
  PLANNED,
  STATUS,
  SUPPLIERS,
  NEEDS_PLAN,
} from '../Filter/constants';
import { useTranslation } from 'react-i18next';
import { useFilterNoPlanByCropId } from './useFilterNoPlan';
import useSortByCropTranslation from '../CropCatalogue/useSortByCropTranslation';
import { managementPlansWithCurrentLocationByCropIdSelector } from '../Task/TaskCrops/managementPlansWithLocationSelector';

export default function useCropVarietyCatalogue(filterString, crop_id) {
  const managementPlansWithCurrentLocationByCropId = useSelector(
    managementPlansWithCurrentLocationByCropIdSelector(crop_id),
  );

  const cropCatalogFilterDate = useSelector(cropCatalogueFilterDateSelector);
  let cropCatalogueFilter = useSelector(cropVarietyFilterSelector(crop_id));
  const managementPlansFilteredByFilterString = useStringFilteredCrops(
    managementPlansWithCurrentLocationByCropId,
    filterString,
  );
  const withoutManagementPlanListByCropId = useSortByCropTranslation(
    useFilterNoPlanByCropId(filterString, crop_id),
  );

  if (!cropCatalogueFilter) {
    cropCatalogueFilter = {
      [LOCATION]: {},
      [SUPPLIERS]: {},
      [STATUS]: {},
    };
  }

  // location filter on management plan.
  const managementPlansFilteredByLocations = useMemo(() => {
    const locationFilter = cropCatalogueFilter[LOCATION];
    const included = new Set();
    for (const location_id in locationFilter) {
      if (locationFilter[location_id].active) included.add(location_id);
    }
    if (included.size === 0) return managementPlansFilteredByFilterString;
    return managementPlansFilteredByFilterString.filter((managementPlan) =>
      included.has(managementPlan.location?.location_id),
    );
  }, [cropCatalogueFilter[LOCATION], managementPlansFilteredByFilterString]);

  // suppliers filter on management plan.
  const managementPlansFilteredBySuppliers = useMemo(() => {
    const supplierFilter = cropCatalogueFilter[SUPPLIERS];
    const included = new Set();
    for (const supplier in supplierFilter) {
      if (supplierFilter[supplier].active) included.add(supplier);
    }
    if (included.size === 0) return managementPlansFilteredByLocations;
    return managementPlansFilteredByLocations.filter((managementPlan) =>
      included.has(managementPlan.supplier),
    );
  }, [cropCatalogueFilter[SUPPLIERS], managementPlansFilteredByLocations]);

  // crop varity list the contains active, abandoned, planned, completed and noPlans count.
  const cropCatalogue = useMemo(() => {
    const time = new Date(cropCatalogFilterDate).getTime();
    const managementPlansByStatus = {
      active: getCurrentManagementPlans(managementPlansFilteredBySuppliers, time),
      abandoned: getAbandonedManagementPlans(managementPlansFilteredBySuppliers, time),
      planned: getPlannedManagementPlans(managementPlansFilteredBySuppliers, time),
      completed: getCompletedManagementPlans(managementPlansFilteredBySuppliers, time),
    };
    const managementPlansByCropId = {};
    for (const status in managementPlansByStatus) {
      for (const managementPlan of managementPlansByStatus[status]) {
        if (!managementPlansByCropId.hasOwnProperty(managementPlan.crop_variety_id)) {
          managementPlansByCropId[managementPlan.crop_variety_id] = {
            active: [],
            abandoned: [],
            planned: [],
            completed: [],
            crop_common_name: managementPlan.crop_common_name,
            crop_translation_key: managementPlan.crop_translation_key,
            imageKey: managementPlan.crop_translation_key?.toLowerCase(),
            crop_id: managementPlan.crop_id,
            crop_photo_url: managementPlan.crop_photo_url,
            crop_variety_photo_url: managementPlan.crop_variety_photo_url,
            crop_variety_id: managementPlan.crop_variety_id,
            crop_variety_name: managementPlan.crop_variety_name,
          };
        }

        managementPlansByCropId[managementPlan.crop_variety_id][status].push(managementPlan);
      }
    }
    // calcluates the needs plans values from crop varieties without management plan
    // and merges it with the crop with the management plan
    const managementPlansByCropIdWithNoPlans = Object.values(managementPlansByCropId).reduce(
      (acc, currentValue) => {
        const noPlanFoundCropVariety = withoutManagementPlanListByCropId.filter(
          (np) => np.crop_variety_name.trim() === currentValue.crop_variety_name.trim(),
        );
        if (!noPlanFoundCropVariety) {
          acc.push({ ...currentValue, noPlans: [] });
        } else {
          acc.push({ ...currentValue, noPlans: noPlanFoundCropVariety });
        }
        return acc;
      },
      [],
    );
    return managementPlansByCropIdWithNoPlans;
  }, [managementPlansFilteredBySuppliers, cropCatalogFilterDate]);

  // filter crop variety on the basis of active, abandoned, planned, completed and noPlan status.
  const cropCatalogueFilteredByStatus = useMemo(() => {
    const statusFilter = cropCatalogueFilter[STATUS];
    const included = new Set();
    for (const status in statusFilter) {
      if (statusFilter[status].active) included.add(status);
    }
    if (included.size === 0) return cropCatalogue;
    const newCropCatalogue = cropCatalogue.map((catalogue) => {
      return {
        ...catalogue,
        active: statusFilter[ACTIVE].active ? catalogue.active : [],
        abandoned: statusFilter[ABANDONED].active ? catalogue.abandoned : [],
        planned: statusFilter[PLANNED].active ? catalogue.planned : [],
        completed: statusFilter[COMPLETE].active ? catalogue.completed : [],
        noPlans: statusFilter[NEEDS_PLAN].active ? catalogue.noPlans : [],
      };
    });
    return newCropCatalogue.filter(
      (catalog) =>
        catalog.active.length ||
        catalog.abandoned.length ||
        catalog.completed.length ||
        catalog.planned.length ||
        catalog.noPlans.length,
    );
  }, [cropCatalogueFilter[STATUS], cropCatalogue]);

  // sort the crop varieties on the basis of active, abandoned, planned, completed.
  const { t } = useTranslation();
  const onlyOneOfTwoNumberIsZero = (i, j) => i + j > 0 && i * j === 0;
  const sortedCropCatalogue = useMemo(() => {
    return cropCatalogueFilteredByStatus.sort((catalog_i, catalog_j) => {
      if (onlyOneOfTwoNumberIsZero(catalog_i.active.length, catalog_j.active.length)) {
        return catalog_j.active.length - catalog_i.active.length;
      } else if (
        onlyOneOfTwoNumberIsZero(catalog_i.planned.length, catalog_j.planned.length) &&
        catalog_j.active.length === 0 &&
        catalog_i.active.length === 0
      ) {
        return catalog_j.planned.length - catalog_i.planned.length;
      } else {
        return t(`crop:${catalog_i.crop_translation_key}`) >
          t(`crop:${catalog_j.crop_translation_key}`)
          ? 1
          : -1;
      }
    });
  }, [cropCatalogueFilteredByStatus]);

  const filteredCropsWithoutManagementPlan = useMemo(() => {
    const cropIdsWithPlan = new Set(
      sortedCropCatalogue.map(({ crop_variety_id }) => crop_variety_id),
    );
    return withoutManagementPlanListByCropId.filter(
      (cropVariety) => !cropIdsWithPlan.has(cropVariety.crop_variety_id),
    );
  }, [withoutManagementPlanListByCropId, sortedCropCatalogue]);

  // used to create flag of no plans in the crop catalogue list.
  const sortedCropCatalogueWithNeedsPlanProp = useMemo(() => {
    const cropIdsWithoutPlan = new Set(
      withoutManagementPlanListByCropId.map(({ crop_variety_id }) => crop_variety_id),
    );
    return sortedCropCatalogue.map((crop) => ({
      ...crop,
      needsPlan: cropIdsWithoutPlan.has(crop.crop_variety_id),
    }));
  }, [withoutManagementPlanListByCropId, sortedCropCatalogue]);

  // to calculate no plans count for each crop that's not having any management plan.
  const filteredCropsWithoutManagementPlanList = filteredCropsWithoutManagementPlan.reduce(
    (acc, currentValue) => {
      if (acc.length === 0) {
        acc.push({ ...currentValue, noPlansCount: 1 });
      } else {
        let noPlanFoundCropVariety = acc.find((pre) => {
          return pre.crop_variety_name === currentValue.crop_variety_name;
        });
        if (!noPlanFoundCropVariety) {
          acc.push({ ...currentValue, noPlansCount: 1 });
        } else {
          const idx = acc.indexOf(noPlanFoundCropVariety);
          acc[idx].noPlansCount += 1;
        }
      }
      return acc;
    },
    [],
  );

  // aggregates the "with plan crop variety" list with the "no plan crop variety" list. this function takes the
  // object from the "no plans crop variety" list and puts it into the "with plan crop variety" list if that crop
  // variety is present in the "with plan crop variety" list along with the plans count.
  const sortedCropCatalogueWithNeedsPlanPropList = sortedCropCatalogueWithNeedsPlanProp.reduce(
    (acc, currentValue) => {
      const noPlanFoundCropVariety = filteredCropsWithoutManagementPlanList.find(
        (np) => np.crop_variety_name.trim() === currentValue.crop_variety_name.trim(),
      );
      const noPlanFoundCropVarietyIndex =
        filteredCropsWithoutManagementPlanList.indexOf(noPlanFoundCropVariety);
      if (!noPlanFoundCropVariety) {
        acc.push({ ...currentValue, noPlansCount: 0 });
      } else {
        filteredCropsWithoutManagementPlanList.splice(noPlanFoundCropVarietyIndex, 1);
        acc.push({ ...currentValue, noPlansCount: noPlanFoundCropVariety.noPlans });
      }
      return acc;
    },
    [],
  );

  // this method is used to calculate the sum of active, planned, completed, noPlans of all
  // crop varieties for a particular crop.
  // Also, calculates the active, abandoned, planned, completed, noPlans for CropStatusInfoBox component
  const cropCataloguesStatus = useMemo(() => {
    const cropsWithoutManagementPlanCount = filteredCropsWithoutManagementPlanList.reduce(
      (acc, c) => {
        acc += c.noPlansCount;
        return acc;
      },
      0,
    );
    const cropCataloguesStatus = {
      active: 0,
      abandoned: 0,
      planned: 0,
      completed: 0,
      noPlans: cropsWithoutManagementPlanCount,
    };
    for (const managementPlansByStatus of cropCatalogueFilteredByStatus) {
      for (const status in cropCataloguesStatus) {
        cropCataloguesStatus[status] += managementPlansByStatus[status].length;
      }
    }
    return {
      ...cropCataloguesStatus,
      sum:
        cropCataloguesStatus.active +
        cropCataloguesStatus.abandoned +
        cropCataloguesStatus.planned +
        cropCataloguesStatus.completed +
        cropCataloguesStatus.noPlans,
    };
  }, [cropCatalogueFilteredByStatus, filteredCropsWithoutManagementPlanList]);

  return {
    cropCatalogue: sortedCropCatalogueWithNeedsPlanPropList,
    filteredCropsWithoutManagementPlan: filteredCropsWithoutManagementPlanList,
    ...cropCataloguesStatus,
  };
}
