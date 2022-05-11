import {
  getCurrentManagementPlans,
  getExpiredManagementPlans,
  getPlannedManagementPlans,
} from '../managementPlanSlice';
import { useSelector } from 'react-redux';
import {
  cropCatalogueFilterDateSelector,
  cropCatalogueFilterSelector,
  cropVarietyFilterSelector,
} from '../filterSlice';
import { useMemo } from 'react';
import useStringFilteredCrops from '../CropCatalogue/useStringFilteredCrops';
import {
  ACTIVE,
  COMPLETE,
  LOCATION,
  PLANNED,
  STATUS,
  SUPPLIERS,
  NEEDS_PLAN,
} from '../Filter/constants';
import { useTranslation } from 'react-i18next';
import useFilterNoPlan from './useFilterNoPlan';
import useSortByCropTranslation from '../CropCatalogue/useSortByCropTranslation';
import { managementPlansWithCurrentLocationSelector } from '../Task/TaskCrops/managementPlansWithLocationSelector';
import { cropVarietiesSelector } from '../../containers/cropVarietySlice';

export default function useCropVarietyCatalogue(filterString, crop_id) {
  const managementPlansWithCurrentLocation = useSelector(
    managementPlansWithCurrentLocationSelector,
  );

  let cropVarieties = useSelector(cropVarietiesSelector);

  const managementPlansWithCurrentLocationByCropId = managementPlansWithCurrentLocation.filter(
    (c) => c.crop_id === crop_id,
  );

  cropVarieties = cropVarieties.filter((c) => c.crop_id === crop_id);

  const cropCatalogFilterDate = useSelector(cropCatalogueFilterDateSelector);
  let cropCatalogueFilter = useSelector(cropVarietyFilterSelector(crop_id));
  const managementPlansFilteredByFilterString = useStringFilteredCrops(
    managementPlansWithCurrentLocationByCropId,
    filterString,
  );

  if (!cropCatalogueFilter) {
    cropCatalogueFilter = {
      [LOCATION]: {},
      [SUPPLIERS]: {},
      [STATUS]: {},
    };
  }

  const _without_management_plan = useSortByCropTranslation(useFilterNoPlan(filterString, crop_id));

  const _without_management_plan_ByCropId = _without_management_plan.filter(
    (c) => c.crop_id === crop_id,
  );

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
      planned: getPlannedManagementPlans(managementPlansFilteredBySuppliers, time),
      past: getExpiredManagementPlans(managementPlansFilteredBySuppliers, time),
    };
    const managementPlansByCropId = {};
    for (const status in managementPlansByStatus) {
      for (const managementPlan of managementPlansByStatus[status]) {
        if (!managementPlansByCropId.hasOwnProperty(managementPlan.crop_variety_id)) {
          managementPlansByCropId[managementPlan.crop_variety_id] = {
            active: [],
            planned: [],
            past: [],
            crop_common_name: managementPlan.crop_common_name,
            crop_translation_key: managementPlan.crop_translation_key,
            imageKey: managementPlan.crop_translation_key?.toLowerCase(),
            crop_id: managementPlan.crop_id,
            crop_photo_url: managementPlan.crop_photo_url,
            crop_variety_id: managementPlan.crop_variety_id,
            crop_variety_name: managementPlan.crop_variety_name,
          };
        }

        managementPlansByCropId[managementPlan.crop_variety_id][status].push(managementPlan);
      }
    }
    const managementPlansByCropId_list = Object.values(managementPlansByCropId);
    const _final_with_plans = managementPlansByCropId_list.reduce((previousValue, currentValue) => {
      const no_plan_found = _without_management_plan_ByCropId.filter(
        (np) => np.crop_variety_name.trim() === currentValue.crop_variety_name.trim(),
      );
      if (!no_plan_found) {
        previousValue.push({ ...currentValue, noPlans: [] });
      } else {
        previousValue.push({ ...currentValue, noPlans: no_plan_found });
      }
      return previousValue;
    }, []);
    return _final_with_plans;
  }, [managementPlansFilteredBySuppliers, cropCatalogFilterDate]);

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
        planned: statusFilter[PLANNED].active ? catalogue.planned : [],
        past: statusFilter[COMPLETE].active ? catalogue.past : [],
        noPlans: statusFilter[NEEDS_PLAN].active ? catalogue.noPlans : [],
      };
    });
    return newCropCatalogue.filter(
      (catalog) =>
        catalog.active.length ||
        catalog.past.length ||
        catalog.planned.length ||
        catalog.noPlans.length,
    );
  }, [cropCatalogueFilter[STATUS], cropCatalogue]);

  const cropCataloguesStatus = useMemo(() => {
    const cropCataloguesStatus = { active: 0, planned: 0, past: 0 };
    for (const managementPlansByStatus of cropCatalogueFilteredByStatus) {
      for (const status in cropCataloguesStatus) {
        cropCataloguesStatus[status] += managementPlansByStatus[status].length;
      }
    }
    return {
      ...cropCataloguesStatus,
      sum: cropCataloguesStatus.active + cropCataloguesStatus.planned + cropCataloguesStatus.past,
    };
  }, [cropCatalogueFilteredByStatus]);

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

  const filteredCropVarietiesWithoutManagementPlan = useSortByCropTranslation(
    useFilterNoPlan(filterString, crop_id),
  );

  const filteredCropVarietiesWithoutManagementPlanByCropId =
    filteredCropVarietiesWithoutManagementPlan.filter((c) => c.crop_id === crop_id);

  const filteredCropsWithoutManagementPlan = useMemo(() => {
    const cropIdsWithPlan = new Set(
      sortedCropCatalogue.map(({ crop_variety_id }) => crop_variety_id),
    );
    return filteredCropVarietiesWithoutManagementPlanByCropId.filter(
      (cropVariety) => !cropIdsWithPlan.has(cropVariety.crop_variety_id),
    );
  }, [filteredCropVarietiesWithoutManagementPlanByCropId, sortedCropCatalogue]);

  const sortedCropCatalogueWithNeedsPlanProp = useMemo(() => {
    const cropIdsWithoutPlan = new Set(
      filteredCropVarietiesWithoutManagementPlanByCropId.map(
        ({ crop_variety_id }) => crop_variety_id,
      ),
    );
    return sortedCropCatalogue.map((crop) => ({
      ...crop,
      needsPlan: cropIdsWithoutPlan.has(crop.crop_variety_id),
    }));
  }, [filteredCropVarietiesWithoutManagementPlanByCropId, sortedCropCatalogue]);

  const _list_data = filteredCropsWithoutManagementPlan.reduce((previousValue, currentValue) => {
    if (previousValue.length === 0) {
      previousValue.push({ ...currentValue, noPlans: 1 });
    } else {
      let _f = previousValue.find((pre) => {
        return pre.crop_variety_name === currentValue.crop_variety_name;
      });
      if (!_f) {
        previousValue.push({ ...currentValue, noPlans: 1 });
      } else {
        const idx = previousValue.indexOf(_f);
        previousValue[idx].noPlans += 1;
      }
    }
    return previousValue;
  }, []);

  const _final_with_plans = sortedCropCatalogueWithNeedsPlanProp.reduce(
    (previousValue, currentValue) => {
      const no_plan_found = _list_data.find(
        (np) => np.crop_variety_name.trim() === currentValue.crop_variety_name.trim(),
      );
      const no_plan_found_idx = _list_data.indexOf(no_plan_found);
      // undefined
      if (!no_plan_found) {
        previousValue.push({ ...currentValue, noPlansCount: 0 });
      } else {
        _list_data.splice(no_plan_found_idx, 1);
        previousValue.push({ ...currentValue, noPlansCount: no_plan_found.noPlans });
      }
      return previousValue;
    },
    [],
  );

  return {
    cropCatalogue: _final_with_plans,
    filteredCropsWithoutManagementPlan: _list_data,
    ...cropCataloguesStatus,
  };
}
