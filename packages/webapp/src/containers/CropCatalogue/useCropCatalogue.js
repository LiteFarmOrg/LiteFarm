import {
  getCurrentManagementPlans,
  getAbandonedManagementPlans,
  getExpiredManagementPlans,
  getPlannedManagementPlans,
} from '../managementPlanSlice';
import { useSelector } from 'react-redux';
import { cropCatalogueFilterDateSelector, cropCatalogueFilterSelector } from '../filterSlice';
import { useMemo } from 'react';
import useStringFilteredCrops from './useStringFilteredCrops';
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
import useFilterNoPlan from './useFilterNoPlan';
import useSortByCropTranslation from './useSortByCropTranslation';
import { managementPlansWithCurrentLocationSelector } from '../Task/TaskCrops/managementPlansWithLocationSelector';

export default function useCropCatalogue(filterString) {
  const managementPlansWithCurrentLocation = useSelector(
    managementPlansWithCurrentLocationSelector,
  );
  const cropCatalogFilterDate = useSelector(cropCatalogueFilterDateSelector);
  const cropCatalogueFilter = useSelector(cropCatalogueFilterSelector);
  const managementPlansFilteredByFilterString = useStringFilteredCrops(
    managementPlansWithCurrentLocation,
    filterString,
  );

  const filteredCropVarietiesWithoutManagementPlanByCropVariety = useSortByCropTranslation(
    useFilterNoPlan(filterString, false),
  );

  // aggregates all crop varieties by crop id and counts the 'Need plans' count value.
  const filteredCropVarietiesWithoutManagementPlan =
    filteredCropVarietiesWithoutManagementPlanByCropVariety.reduce((acc, cropVariety) => {
      if (acc.length === 0) {
        acc.push({ ...cropVariety, noPlansCount: 1 });
      } else {
        let cropFound = acc.find((crop) => crop.crop_id === cropVariety.crop_id);
        if (!cropFound) {
          acc.push({ ...cropVariety, noPlansCount: 1 });
        } else {
          cropFound.noPlansCount += 1;
        }
      }
      return acc;
    }, []);

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

  const cropCatalogue = useMemo(() => {
    const time = new Date(cropCatalogFilterDate).getTime();
    const managementPlansByStatus = {
      active: getCurrentManagementPlans(managementPlansFilteredBySuppliers, time),
      abandoned: getAbandonedManagementPlans(managementPlansFilteredBySuppliers, time),
      planned: getPlannedManagementPlans(managementPlansFilteredBySuppliers, time),
      past: getExpiredManagementPlans(managementPlansFilteredBySuppliers, time),
    };
    const managementPlansByCropId = {};
    for (const status in managementPlansByStatus) {
      for (const managementPlan of managementPlansByStatus[status]) {
        if (!managementPlansByCropId.hasOwnProperty(managementPlan.crop_id)) {
          managementPlansByCropId[managementPlan.crop_id] = {
            active: [],
            abandoned: [],
            planned: [],
            past: [],
            crop_common_name: managementPlan.crop_common_name,
            crop_translation_key: managementPlan.crop_translation_key,
            imageKey: managementPlan.crop_translation_key?.toLowerCase(),
            crop_id: managementPlan.crop_id,
            crop_photo_url: managementPlan.crop_photo_url,
          };
        }

        managementPlansByCropId[managementPlan.crop_id][status].push(managementPlan);
      }
    }
    // calcluates the needs plans values from crop varieties without management plan
    // and merges it with the crop with the management plan
    const managementPlansByCropIdWithNoPlans = Object.values(managementPlansByCropId).reduce(
      (acc, currentValue) => {
        const noPlanFoundCrop = filteredCropVarietiesWithoutManagementPlanByCropVariety.filter(
          (np) => np.crop_id === currentValue.crop_id,
        );
        if (!noPlanFoundCrop) {
          acc.push({ ...currentValue, noPlans: [] });
        } else {
          acc.push({
            ...currentValue,
            noPlans: noPlanFoundCrop.map((c) => ({ crop_variety_name: c.crop_variety_name })),
          });
        }
        return acc;
      },
      [],
    );
    return managementPlansByCropIdWithNoPlans;
  }, [managementPlansFilteredBySuppliers, cropCatalogFilterDate]);

  const cropCatalogueFilteredByStatus = useMemo(() => {
    const statusFilter = cropCatalogueFilter[STATUS];
    const included = new Set();
    for (const status in statusFilter) {
      if (statusFilter[status].active) included.add(status);
    }
    if (included.size === 0) return cropCatalogue;
    const newCropCatalogue = cropCatalogue.map((catalogue) => ({
      ...catalogue,
      active: statusFilter[ACTIVE].active ? catalogue.active : [],
      abandoned: statusFilter[ABANDONED].active ? catalogue.abandoned : [],
      planned: statusFilter[PLANNED].active ? catalogue.planned : [],
      past: statusFilter[COMPLETE].active ? catalogue.past : [],
      noPlans: statusFilter[NEEDS_PLAN].active ? catalogue.noPlans : [],
    }));
    return newCropCatalogue.filter(
      (catalog) =>
        catalog.active.length ||
        catalog.abandoned.length ||
        catalog.past.length ||
        catalog.planned.length ||
        catalog.noPlans.length,
    );
  }, [cropCatalogueFilter[STATUS], cropCatalogue]);

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
    const cropIdsWithPlan = new Set(sortedCropCatalogue.map(({ crop_id }) => crop_id));
    return filteredCropVarietiesWithoutManagementPlan.filter(
      (cropVariety) => !cropIdsWithPlan.has(cropVariety.crop_id),
    );
  }, [filteredCropVarietiesWithoutManagementPlan, sortedCropCatalogue]);

  const sortedCropCatalogueWithNeedsPlanProp = useMemo(() => {
    const cropIdsWithoutPlan = new Set(
      filteredCropVarietiesWithoutManagementPlan.map(({ crop_id }) => crop_id),
    );
    return sortedCropCatalogue.map((crop) => ({
      ...crop,
      needsPlan: cropIdsWithoutPlan.has(crop.crop_id),
    }));
  }, [filteredCropVarietiesWithoutManagementPlan, sortedCropCatalogue]);

  // this method is used to calculate the sum of active, abandoned, planned, past, noPlans of all
  // crop varieties for a particular crop.
  // calculates the active, abandoned, planned, past, noPlans for CropStatusInfoBox component.
  const cropCataloguesStatus = useMemo(() => {
    const cropCataloguesStatus = { active: 0, abandoned: 0, planned: 0, past: 0, noPlans: 0 };
    for (const managementPlansByStatus of cropCatalogueFilteredByStatus) {
      for (const status in cropCataloguesStatus) {
        cropCataloguesStatus[status] += managementPlansByStatus[status].length;
      }
    }
    cropCataloguesStatus.noPlans = filteredCropVarietiesWithoutManagementPlan.reduce((acc, c) => {
      acc += c.noPlansCount;
      return acc;
    }, 0);
    return {
      ...cropCataloguesStatus,
      sum:
        cropCataloguesStatus.active +
        cropCataloguesStatus.abandoned +
        cropCataloguesStatus.planned +
        cropCataloguesStatus.past +
        cropCataloguesStatus.noPlans,
    };
  }, [cropCatalogueFilteredByStatus, filteredCropVarietiesWithoutManagementPlan]);

  return {
    cropCatalogue: sortedCropCatalogueWithNeedsPlanProp,
    filteredCropsWithoutManagementPlan,
    ...cropCataloguesStatus,
  };
}
