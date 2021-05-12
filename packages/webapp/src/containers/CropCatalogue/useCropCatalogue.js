import {
  fieldCropsSelector,
  getCurrentFieldCrops,
  getExpiredFieldCrops,
  getPlannedFieldCrops,
} from '../fieldCropSlice';
import { useSelector } from 'react-redux';
import { cropCatalogueFilterDateSelector } from '../filterSlice';
import { useMemo } from 'react';
import useStringFilteredCrops from './useStringFilteredCrops';

export default function useCropCatalogue(filterString) {
  const fieldCrops = useSelector(fieldCropsSelector);
  const cropCatalogFilterDate = useSelector(cropCatalogueFilterDateSelector);
  const fieldCropsFilteredByFilterString = useStringFilteredCrops(fieldCrops, filterString);
  //TODO: location useMemo
  const fieldCropsFilteredByLocations = fieldCropsFilteredByFilterString;
  //TODO: supplier useMemo
  const fieldCropsFilteredBySuppliers = fieldCropsFilteredByLocations;

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

  //TODO: status useMemo
  const cropCatalogueFilteredByStatus = cropCatalogue;

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
