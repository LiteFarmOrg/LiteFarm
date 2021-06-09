import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LOCATION, STATUS, SUPPLIERS } from '../Filter/constants';
import { cropVarietyFilterSelector } from '../filterSlice';

export default function useFilterVarieties(varieties, cropId, status) {
  const cropVarietyFilter = useSelector(cropVarietyFilterSelector(cropId));
  const filteredBySupplier = useMemo(() => {
    if (!cropVarietyFilter) return varieties;
    const supplierFilter = cropVarietyFilter[SUPPLIERS];
    const included = new Set(
      Object.keys(supplierFilter).filter((supplier) => supplierFilter[supplier].active),
    );
    if (included.size === 0) return varieties;
    return varieties.filter((variety) => included.has(variety.supplier));
  }, [cropVarietyFilter?.[SUPPLIERS], varieties]);

  const filteredByLocation = useMemo(() => {
    if (!cropVarietyFilter) return filteredBySupplier;
    const locationFilter = cropVarietyFilter[LOCATION];
    const included = new Set(
      Object.keys(locationFilter).filter((location_id) => locationFilter[location_id].active),
    );
    if (included.size === 0) return filteredBySupplier;
    return varieties.filter((variety) => included.has(variety.location_id));
  }, [cropVarietyFilter?.[LOCATION], filteredBySupplier]);

  const filteredByStatus = useMemo(() => {
    if (!cropVarietyFilter) return filteredByLocation;
    const statusFilter = cropVarietyFilter[STATUS];
    const activeFilterSuppliers = new Set(
      Object.keys(statusFilter).filter((status) => statusFilter[status].active),
    );
    if (!activeFilterSuppliers.size || statusFilter[status].active) {
      return filteredByLocation;
    } else {
      return [];
    }
  }, [cropVarietyFilter?.[STATUS], filteredByLocation]);
  return filteredByStatus;
}
