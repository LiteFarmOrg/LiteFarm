import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LOCATION, STATUS, SUPPLIERS } from '../Filter/constants';
import { cropVarietyFilterSelector } from '../filterSlice';

export default function useFilterVarieties(varieties, cropId, status) {
  const { t } = useTranslation();
  const cropVarietyFilter = useSelector(cropVarietyFilterSelector(cropId));
  console.log('useFilterVarieties');
  const filteredBySupplier = useMemo(() => {
    const supplierFilter = cropVarietyFilter[SUPPLIERS];
    const included = new Set();
    for (const supplier in supplierFilter) {
      if (supplierFilter[supplier].active) included.add(supplier);
    }
    if (included.size === 0) return varieties;
    return varieties.filter((variety) => included.has(variety.supplier));
  }, [cropVarietyFilter[SUPPLIERS], varieties]);

  const filteredByLocation = useMemo(() => {
    const locationFilter = cropVarietyFilter[LOCATION];
    const included = new Set();
    for (const location_id in locationFilter) {
      if (locationFilter[location_id].active) included.add(location_id);
    }
    if (included.size === 0) return filteredBySupplier;
    return varieties.filter((variety) => included.has(variety.location_id));
  }, [cropVarietyFilter[LOCATION], filteredBySupplier]);

  const filteredByStatus = useMemo(() => {
    const statusFilter = cropVarietyFilter[STATUS];
    const activeFilterSuppliers = new Set(
      Object.keys(statusFilter).filter((status) => statusFilter[status].active),
    );
    if (!activeFilterSuppliers.size || statusFilter[status].active) {
      return filteredByLocation;
    } else {
      return [];
    }
  }, [cropVarietyFilter[STATUS], filteredByLocation]);
  return filteredByStatus;
}
