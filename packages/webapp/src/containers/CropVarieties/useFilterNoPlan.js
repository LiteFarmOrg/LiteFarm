import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LOCATION, NEEDS_PLAN, STATUS, SUPPLIERS } from '../Filter/constants';
import { cropVarietyFilterSelector } from '../filterSlice';
import useStringFilteredCrops from '../CropCatalogue/useStringFilteredCrops';
import useSortByCropTranslation from '../CropCatalogue/useSortByCropTranslation';
import {
  cropsWithVarietyWithoutManagementPlanSelector,
  getUniqueEntities,
  managementPlansSelector,
} from '../managementPlanSlice';
import { cropVarietiesSelector } from '../cropVarietySlice';

export default function useFilterNoPlan(filterString, crop_id) {
  const managementPlans = useSelector(managementPlansSelector);
  const cropVarieties = useSelector(cropVarietiesSelector);
  let cropCatalogueFilter = useSelector(cropVarietyFilterSelector(crop_id));

  if (!cropCatalogueFilter) {
    cropCatalogueFilter = {
      [LOCATION]: {},
      [SUPPLIERS]: {},
      [STATUS]: {},
    };
  }

  const varietiesFilteredBySupplier = useMemo(() => {
    const supplierFilter = cropCatalogueFilter[SUPPLIERS];
    const activeFilterSuppliers = new Set(
      Object.keys(supplierFilter).filter((supplier) => supplierFilter[supplier].active),
    );
    return activeFilterSuppliers.size
      ? cropVarieties.filter((crop) => activeFilterSuppliers.has(crop.supplier))
      : cropVarieties;
  }, [cropCatalogueFilter[SUPPLIERS], cropVarieties]);

  const varietiesFilteredByString = useStringFilteredCrops(
    useSortByCropTranslation(varietiesFilteredBySupplier),
    filterString,
  );

  const cropsWithNoPlans = useMemo(() => {
    const cropVarietyIds = new Set(managementPlans.map(({ crop_variety_id }) => crop_variety_id));
    return getUniqueEntities(
      varietiesFilteredByString.filter(
        (cropVariety) => !cropVarietyIds.has(cropVariety.crop_variety_id),
      ),
      'crop_variety_id',
    );
  }, [managementPlans, varietiesFilteredByString]);

  const cropsFilteredByStatusAndLocation = useMemo(() => {
    const locationFilter = cropCatalogueFilter[LOCATION];
    for (const location in locationFilter) {
      if (locationFilter[location].active) {
        return [];
      }
    }

    const statusFilter = cropCatalogueFilter[STATUS];
    const activeFilterStatus = new Set(
      Object.keys(statusFilter).filter((status) => statusFilter[status].active),
    );
    if (!statusFilter[NEEDS_PLAN]?.active && activeFilterStatus.size) return [];

    return cropsWithNoPlans;
  }, [cropsWithNoPlans, cropCatalogueFilter[STATUS], cropCatalogueFilter[LOCATION]]);

  return cropsFilteredByStatusAndLocation;
}

export const useFilterNoPlanByCropId = (filterString, crop_id) =>
  useFilterNoPlan(filterString, crop_id).filter((c) => c.crop_id === crop_id);
