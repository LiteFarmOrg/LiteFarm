/*
 *  Copyright 2024 LiteFarm.org
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

import { useMemo } from 'react';
import { useTranslation, TFunction, Trans } from 'react-i18next';
import {
  useGetDefaultAnimalTypesQuery,
  useGetCustomAnimalTypesQuery,
} from '../../../../store/api/apiSlice';
import { PureTileDashboard, TypeCountTile } from '../../../../components/TileDashboard';
import useQueries from '../../../../hooks/api/useQueries';
import { CustomAnimalType, DefaultAnimalType } from '../../../../store/api/types';
import { getComparator } from '../../../../util/sort';
import { generateUniqueAnimalId } from '../../../../util/animal';
import { isAnimalTypeIconKey } from '../../../../components/Icons/icons';
import { useSectionHeader } from '../../../../components/Navigation/useSectionHeaders';
import { useLocation } from 'react-router-dom-v5-compat';

const formatAnimalTypes = (
  types: (DefaultAnimalType | CustomAnimalType)[],
  onTypeClick: (typeId: string) => void,
  t: TFunction,
) => {
  const formattedTypes: TypeCountTile[] = [];
  types.forEach((type) => {
    if (type.count) {
      const label = 'type' in type ? type.type : t(`animal:TYPE.${type.key}`);
      const iconKey = 'key' in type && isAnimalTypeIconKey(type.key) ? type.key : 'CUSTOM_ANIMAL';
      const id = generateUniqueAnimalId(type);

      formattedTypes.push({
        label: label.toLowerCase(),
        count: type.count,
        iconName: iconKey,
        id,
        onClick: () => onTypeClick(id),
      });
    }
  });
  return formattedTypes;
};

interface KPIProps {
  selectedTypeIds: string[];
  onTypeClick: (typeId: string) => void;
}

function KPI({ selectedTypeIds, onTypeClick }: KPIProps) {
  let location = useLocation();
  const { t } = useTranslation(['translation', 'common', 'animal']);
  const { data, isLoading } = useQueries([
    { label: 'defaultAnimalTypes', hook: useGetDefaultAnimalTypesQuery, params: '?count=true' },
    { label: 'customAnimalTypes', hook: useGetCustomAnimalTypesQuery, params: '?count=true' },
  ]);

  const types = useMemo(() => {
    if (isLoading || !data) {
      return [];
    }

    const { defaultAnimalTypes, customAnimalTypes } = data;
    const types = formatAnimalTypes([...defaultAnimalTypes, ...customAnimalTypes], onTypeClick, t);
    types.sort(getComparator('asc', 'label'));

    return types;
  }, [data, isLoading, onTypeClick]);

  const animalInventoryTitle = useSectionHeader(location.pathname) || '';

  return (
    <PureTileDashboard
      typeCountTiles={types}
      dashboardTitle={animalInventoryTitle}
      categoryLabel={t('common:TYPES')}
      selectedFilterIds={selectedTypeIds}
    />
  );
}

export default KPI;
