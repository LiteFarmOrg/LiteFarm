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

import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation, TFunction } from 'react-i18next';
import {
  useGetDefaultAnimalTypesQuery,
  useGetCustomAnimalTypesQuery,
} from '../../../../store/api/apiSlice';
import { PureTileDashboard, TypeCountTile } from '../../../../components/TileDashboard';
import useQueries from '../../../../hooks/api/useQueries';
import { CustomAnimalType, DefaultAnimalType } from '../../../../store/api/types';
import { ReactComponent as CattleIcon } from '../../../../assets/images/animals/cattle-icon.svg';
import { ReactComponent as ChickenIcon } from '../../../../assets/images/animals/chicken-icon.svg';
import { ReactComponent as PigIcon } from '../../../../assets/images/animals/pig-icon.svg';
import { ReactComponent as CustomIcon } from '../../../../assets/images/nav/animals.svg';
import { uppercaseTheFirstLetter } from '../../../../util';
import { getComparator } from '../../../../util/sort';
import { generateUniqueAnimalTypeId } from '../../../../util/animal';
import styles from './styles.module.scss';

const icons = {
  CATTLE: <CattleIcon />,
  CHICKEN_BROILERS: <ChickenIcon />,
  CHICKEN_LAYERS: <ChickenIcon />,
  PIGS: <PigIcon />,
  '': <CustomIcon />,
};

const formatAnimalTypes = (
  types: (DefaultAnimalType | CustomAnimalType)[],
  onTypeClick: (typeId: string) => void,
  t: TFunction,
) => {
  const formattedTypes: TypeCountTile[] = [];
  types.forEach((type) => {
    if (type.count) {
      const label = 'type' in type ? type.type : t(`animalTypes:${type.key}`);
      const iconKey = ('key' in type ? type.key : '') as keyof typeof icons;
      const id = generateUniqueAnimalTypeId(type);

      formattedTypes.push({
        label: uppercaseTheFirstLetter(label),
        count: type.count,
        icon: icons[iconKey],
        id,
        onClick: () => onTypeClick(id),
      });
    }
  });
  return formattedTypes;
};

interface KPIProps {
  isCompactSideMenu: boolean;
  selectedTypeIds: string[];
  onTypeClick: (typeId: string) => void;
}

function KPI({ isCompactSideMenu, selectedTypeIds, onTypeClick }: KPIProps) {
  const [kpiHeight, setKpiHeight] = useState<number | null>(null);

  const { t } = useTranslation(['translation', 'common', 'animalTypes']);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useQueries([
    { label: 'defaultAnimalTypes', hook: useGetDefaultAnimalTypesQuery, params: '?count=true' },
    { label: 'customAnimalTypes', hook: useGetCustomAnimalTypesQuery, params: '?count=true' },
  ]);

  useEffect(() => {
    const setHeight = () => setKpiHeight(wrapperRef.current?.offsetHeight || null);

    setHeight();
    window.addEventListener('resize', () => {
      setHeight();
    });

    return () => {
      window.removeEventListener('resize', () => {
        setHeight();
      });
    };
  }, []);

  const types = useMemo(() => {
    if (isLoading || !data) {
      return [];
    }

    const { defaultAnimalTypes, customAnimalTypes } = data;
    const types = formatAnimalTypes([...defaultAnimalTypes, ...customAnimalTypes], onTypeClick, t);
    types.sort(getComparator('asc', 'label'));

    return types;
  }, [data, isLoading, onTypeClick]);

  return (
    <div style={{ height: kpiHeight || 0 }}>
      <div
        ref={wrapperRef}
        className={clsx(styles.wrapper, isCompactSideMenu && styles.withCompactMenu)}
      >
        <PureTileDashboard
          typeCountTiles={types}
          dashboardTitle={t('SECTION_HEADER.ANIMALS_INVENTORY')}
          categoryLabel={t('TYPES').toUpperCase()}
          selectedFilterIds={selectedTypeIds}
        />
      </div>
    </div>
  );
}

export default KPI;
