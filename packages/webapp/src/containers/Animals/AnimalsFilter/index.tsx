/*
 *  Copyright 2024-25 LiteFarm.org
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
import { setAnimalsFilter, animalsFilterSelector, initialAnimalsFilter } from '../../filterSlice';
import FilterDrawerContainer from '../../Filter/FilterDrawerContainer';
import AnimalsFilterContent from '../../Filter/Animals/';
import type { AnimalsFilterKeys } from '../../Filter/Animals/types';

const AnimalsFilter = ({ isFilterActive }: { isFilterActive: boolean }) => {
  const { t } = useTranslation();

  return (
    <FilterDrawerContainer<AnimalsFilterKeys>
      isFilterActive={isFilterActive}
      filterSelector={animalsFilterSelector}
      setFilterAction={setAnimalsFilter}
      initialFilter={initialAnimalsFilter}
      drawerTitle={t('ANIMAL.FILTER.TITLE')}
    >
      {({ filter, onChange }) => (
        <AnimalsFilterContent animalsFilter={filter} onChange={onChange} />
      )}
    </FilterDrawerContainer>
  );
};

export default AnimalsFilter;
