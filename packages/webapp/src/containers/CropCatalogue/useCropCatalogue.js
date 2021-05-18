import {
  fieldCropsSelector,
  getCurrentFieldCrops,
  getExpiredFieldCrops,
  getPlannedFieldCrops,
} from '../fieldCropSlice';
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

export default function useCropCatalogue(filterString) {
  const fieldCrops = useSelector(fieldCropsSelector);
  const cropCatalogFilterDate = useSelector(cropCatalogueFilterDateSelector);
  const cropCatalogueFilter = useSelector(cropCatalogueFilterSelector);
  const fieldCropsFilteredByFilterString = useStringFilteredCrops(fieldCrops, filterString);

  const fieldCropsFilteredByLocations = useMemo(() => {
    const locationFilter = cropCatalogueFilter[LOCATION];
    const included = new Set();
    for (const location_id in locationFilter) {
      if (locationFilter[location_id]) included.add(location_id);
    }
    if (included.size === 0) return fieldCropsFilteredByFilterString;
    return fieldCropsFilteredByFilterString.filter((fieldCrop) =>
      included.has(fieldCrop.location_id),
    );
  }, [cropCatalogueFilter[LOCATION], fieldCropsFilteredByFilterString]);

  const fieldCropsFilteredBySuppliers = useMemo(() => {
    const supplierFilter = cropCatalogueFilter[SUPPLIERS];
    const included = new Set();
    for (const supplier in supplierFilter) {
      if (supplierFilter[supplier]) included.add(supplier);
    }
    if (included.size === 0) return fieldCropsFilteredByLocations;
    return fieldCropsFilteredByLocations.filter((fieldCrop) => included.has(fieldCrop.supplier));
  }, [cropCatalogueFilter[SUPPLIERS], fieldCropsFilteredByLocations]);

  const cropCatalogue = useMemo(() => {
    const time = new Date(cropCatalogFilterDate).getTime();
    const fieldCropsByStatus = {
      active: getCurrentFieldCrops(fieldCropsFilteredBySuppliers, time),
      planned: getPlannedFieldCrops(fieldCropsFilteredBySuppliers, time),
      past: getExpiredFieldCrops(fieldCropsFilteredBySuppliers, time),
    };
    const fieldCropsByCropId = {};
    for (const status in fieldCropsByStatus) {
      for (const fieldCrop of fieldCropsByStatus[status]) {
        if (!fieldCropsByCropId.hasOwnProperty(fieldCrop.crop_id)) {
          fieldCropsByCropId[fieldCrop.crop_id] = {
            active: [],
            planned: [],
            past: [],
            crop_common_name: fieldCrop.crop_common_name,
            crop_translation_key: fieldCrop.crop_translation_key,
            imageKey: fieldCrop.crop_translation_key?.toLowerCase(),
            crop_id: fieldCrop.crop_id,
          };
        }

        fieldCropsByCropId[fieldCrop.crop_id][status].push(fieldCrop);
      }
    }
    return Object.values(fieldCropsByCropId);
  }, [fieldCropsFilteredBySuppliers, cropCatalogFilterDate]);

  const cropCatalogueFilteredByStatus = useMemo(() => {
    const statusFilter = cropCatalogueFilter[STATUS];
    const included = new Set();
    for (const status in statusFilter) {
      if (statusFilter[status]) included.add(status);
    }
    if (included.size === 0) return cropCatalogue;
    const newCropCatalogue = cropCatalogue.map((catalogue) => ({
      ...catalogue,
      active: statusFilter[ACTIVE] ? catalogue.active : [],
      planned: statusFilter[PLANNED] ? catalogue.planned : [],
      past: statusFilter[COMPLETE] ? catalogue.past : [],
    }));
    return newCropCatalogue.filter(
      (catalog) => catalog.active.length || catalog.past.length || catalog.planned.length,
    );
  }, [cropCatalogueFilter[STATUS], cropCatalogue]);

  const cropCataloguesStatus = useMemo(() => {
    const cropCataloguesStatus = { active: 0, planned: 0, past: 0 };
    for (const fieldCropsByStatus of cropCatalogueFilteredByStatus) {
      for (const status in fieldCropsByStatus) {
        cropCataloguesStatus[status] += fieldCropsByStatus[status].length;
      }
    }
    return {
      ...cropCataloguesStatus,
      sum: cropCataloguesStatus.active + cropCataloguesStatus.planned + cropCataloguesStatus.past,
    };
  }, [cropCatalogueFilteredByStatus]);

  const sortedCropCatalogue = cropCatalogueFilteredByStatus;
  return { cropCatalogue: cropCatalogueFilteredByStatus, ...cropCataloguesStatus };
}
