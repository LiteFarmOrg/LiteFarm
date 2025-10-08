/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useTranslation } from 'react-i18next';
import FilterGroup from '../../../components/Filter/FilterGroup';
import type { ReduxFilterEntity, ContainerOnChangeCallback, FilterState } from '../types';
import { FilterType, type ComponentFilter } from '../../../components/Filter/types';
import { useGetSoilAmendmentFertiliserTypesQuery } from '../../../store/api/apiSlice';
import { ProductCategory, InventoryFilterKeys } from './types';
import { sortFilterOptions } from '../../../components/Filter/utils';

interface ProductInventoryFilterContentProps {
  inventoryFilter: ReduxFilterEntity<InventoryFilterKeys>;
  filterContainerClassName?: string;
  onChange: ContainerOnChangeCallback;
}

const ProductInventoryFilterContent = ({
  inventoryFilter,
  filterContainerClassName,
  onChange,
}: ProductInventoryFilterContentProps) => {
  const { t } = useTranslation(['translation', 'filter']);

  const { data: fertiliserTypes = [] } = useGetSoilAmendmentFertiliserTypesQuery();

  const handleChange = (filterKey: string, filterState: FilterState) => {
    onChange?.(filterKey, filterState);
  };

  const filters: ComponentFilter[] = [
    {
      subject: t('INVENTORY.CUSTOM_OR_LITEFARM_LIBRARY'),
      type: FilterType.SEARCHABLE_MULTI_SELECT,
      filterKey: InventoryFilterKeys.CUSTOM_OR_LIBRARY,
      options: [
        {
          value: ProductCategory.CUSTOM,
          default:
            inventoryFilter[InventoryFilterKeys.CUSTOM_OR_LIBRARY][ProductCategory.CUSTOM]
              ?.active ?? false,
          label: t('INVENTORY.CUSTOM'),
        },
        {
          value: ProductCategory.LIBRARY,
          default:
            inventoryFilter[InventoryFilterKeys.CUSTOM_OR_LIBRARY][ProductCategory.LIBRARY]
              ?.active ?? false,
          label: t('INVENTORY.LITEFARM_LIBRARY'),
        },
      ],
    },
    {
      subject: t('INVENTORY.FERTILISER_TYPE'),
      type: FilterType.SEARCHABLE_MULTI_SELECT,
      filterKey: InventoryFilterKeys.FERTILISER_TYPE,
      options: fertiliserTypes.map((type) => ({
        value: type.id,
        default: inventoryFilter[InventoryFilterKeys.FERTILISER_TYPE][type.id]?.active ?? false,
        // t('INVENTORY.FILTER.DRY')
        // t('INVENTORY.FILTER.LIQUID')
        label: t(`INVENTORY.FILTER.${type.key}`),
      })),
    },
  ];

  return (
    <FilterGroup
      filters={filters.map(sortFilterOptions)}
      filterContainerClassName={filterContainerClassName}
      onChange={handleChange}
      showIndividualFilterControls
    />
  );
};

export default ProductInventoryFilterContent;
