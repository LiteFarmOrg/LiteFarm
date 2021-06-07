import {
  getCurrentManagementPlans,
  getExpiredManagementPlans,
  getPlannedManagementPlans,
  managementPlansSelector,
} from '../managementPlanSlice';
import { useSelector } from 'react-redux';
import { cropCatalogueFilterDateSelector, cropCatalogueFilterSelector } from '../filterSlice';
import { useMemo } from 'react';
import useStringFilteredCrops from './useStringFilteredCrops';
import {
  ACTIVE,
  COMPLETE,
  LOCATION,
  PLANNED,
  STATUS,
  SUPPLIERS,
} from '../Filter/CropCatalogue/constants';
import { useTranslation } from 'react-i18next';

export default function useCropCatalogue(filterString) {
  const managementPlans = useSelector(managementPlansSelector);
  const cropCatalogFilterDate = useSelector(cropCatalogueFilterDateSelector);
  const cropCatalogueFilter = useSelector(cropCatalogueFilterSelector);
  const managementPlansFilteredByFilterString = useStringFilteredCrops(
    managementPlans,
    filterString,
  );

  const managementPlansFilteredByLocations = useMemo(() => {
    const locationFilter = cropCatalogueFilter[LOCATION];
    const included = new Set();
    for (const location_id in locationFilter) {
      if (locationFilter[location_id].active) included.add(location_id);
    }
    if (included.size === 0) return managementPlansFilteredByFilterString;
    return managementPlansFilteredByFilterString.filter((managementPlan) =>
      included.has(managementPlan.location_id),
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
        if (!managementPlansByCropId.hasOwnProperty(managementPlan.crop_id)) {
          managementPlansByCropId[managementPlan.crop_id] = {
            active: [],
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
    return Object.values(managementPlansByCropId);
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
      planned: statusFilter[PLANNED].active ? catalogue.planned : [],
      past: statusFilter[COMPLETE].active ? catalogue.past : [],
    }));
    return newCropCatalogue.filter(
      (catalog) => catalog.active.length || catalog.past.length || catalog.planned.length,
    );
  }, [cropCatalogueFilter[STATUS], cropCatalogue]);

  const cropCataloguesStatus = useMemo(() => {
    const cropCataloguesStatus = { active: 0, planned: 0, past: 0 };
    for (const managementPlansByStatus of cropCatalogueFilteredByStatus) {
      for (const status in managementPlansByStatus) {
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
  return { cropCatalogue: sortedCropCatalogue, ...cropCataloguesStatus };
}
