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

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import FilterGroup from '../../../components/Filter/FilterGroup';
import type { ReduxFilterEntity, ContainerOnChangeCallback, Location, FilterState } from '../types';
import { FilterType, type ComponentFilter } from '../../../components/Filter/types';
import {
  useGetDefaultAnimalTypesQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetCustomAnimalBreedsQuery,
  useGetAnimalGroupsQuery,
  useGetAnimalSexesQuery,
} from '../../../store/api/apiSlice';
import { generateUniqueAnimalId } from '../../../util/animal';
import { useVisibleBreeds } from './useVisibleBreeds';
import { locationsSelector } from '../../locationSlice';
import { AnimalsFilterKeys } from './types';
import { AnimalOrBatchKeys } from '../../Animals/types';
import { sortFilterOptions } from '../../../components/Filter/utils';

interface AnimalsFilterContentProps {
  animalsFilter: ReduxFilterEntity<AnimalsFilterKeys>;
  tempAnimalsFilter: ReduxFilterEntity<AnimalsFilterKeys>;
  filterContainerClassName?: string;
  onChange: ContainerOnChangeCallback;
}

const AnimalsFilterContent = ({
  animalsFilter,
  tempAnimalsFilter,
  filterContainerClassName,
  onChange,
}: AnimalsFilterContentProps) => {
  const { t } = useTranslation(['translation', 'filter']);

  const locations: Location[] = useSelector(locationsSelector);

  const { data: defaultTypes = [] } = useGetDefaultAnimalTypesQuery();
  const { data: customTypes = [] } = useGetCustomAnimalTypesQuery();
  const { data: defaultBreeds = [] } = useGetDefaultAnimalBreedsQuery();
  const { data: customBreeds = [] } = useGetCustomAnimalBreedsQuery();
  const { data: sexes = [] } = useGetAnimalSexesQuery();
  const { data: groups = [] } = useGetAnimalGroupsQuery();

  const { handleBreedsChange, filteredDefaultBreeds, filteredCustomBreeds } = useVisibleBreeds(
    defaultBreeds,
    customBreeds,
    tempAnimalsFilter,
  );

  const handleChange = (filterKey?: string, filterState?: FilterState) => {
    onChange?.(filterKey, filterState);
    handleBreedsChange(filterKey);
  };

  const filters: ComponentFilter[] = [
    {
      subject: t('ANIMAL.FILTER.BATCHES_OR_INDIVIDUALS'),
      type: FilterType.SEARCHABLE_MULTI_SELECT,
      filterKey: AnimalsFilterKeys.ANIMAL_OR_BATCH,
      options: [
        {
          value: AnimalOrBatchKeys.ANIMAL,
          default:
            animalsFilter[AnimalsFilterKeys.ANIMAL_OR_BATCH][AnimalOrBatchKeys.ANIMAL]?.active ??
            false,
          label: t('ANIMAL.FILTER.INDIVIDUALS'),
        },
        {
          value: AnimalOrBatchKeys.BATCH,
          default:
            animalsFilter[AnimalsFilterKeys.ANIMAL_OR_BATCH][AnimalOrBatchKeys.BATCH]?.active ??
            false,
          label: t('ANIMAL.FILTER.BATCHES'),
        },
      ],
    },
    {
      subject: t('ANIMAL.ANIMAL_TYPE'),
      type: FilterType.SEARCHABLE_MULTI_SELECT,
      filterKey: AnimalsFilterKeys.TYPE,
      options: [
        ...customTypes.map((animalType) => ({
          value: generateUniqueAnimalId(animalType),
          default:
            animalsFilter[AnimalsFilterKeys.TYPE][generateUniqueAnimalId(animalType)]?.active ??
            false,
          label: animalType.type,
        })),
        ...defaultTypes.map((animalType) => ({
          value: generateUniqueAnimalId(animalType),
          default:
            animalsFilter[AnimalsFilterKeys.TYPE][generateUniqueAnimalId(animalType)]?.active ??
            false,
          label: t(`animal:TYPE.${animalType.key}`),
        })),
      ],
    },
    {
      subject: t('ANIMAL.ANIMAL_BREED'),
      type: FilterType.SEARCHABLE_MULTI_SELECT,
      filterKey: AnimalsFilterKeys.BREED,
      options: [
        ...filteredCustomBreeds.map((animalBreed) => ({
          value: generateUniqueAnimalId(animalBreed),
          default:
            animalsFilter[AnimalsFilterKeys.BREED][generateUniqueAnimalId(animalBreed)]?.active ??
            false,
          label: animalBreed.breed,
        })),
        ...filteredDefaultBreeds.map((animalBreed) => ({
          value: generateUniqueAnimalId(animalBreed),
          default:
            animalsFilter[AnimalsFilterKeys.BREED][generateUniqueAnimalId(animalBreed)]?.active ??
            false,
          label: t(`animal:BREED.${animalBreed.key}`),
        })),
      ],
    },
    {
      subject: t('ANIMAL.ANIMAL_SEXES'),
      type: FilterType.SEARCHABLE_MULTI_SELECT,
      filterKey: AnimalsFilterKeys.SEX,
      options: sexes.map((sex) => ({
        value: sex.id,
        default: animalsFilter[AnimalsFilterKeys.SEX][sex.id]?.active ?? false,
        label: t(`ANIMAL.FILTER.${sex.key}`),
      })),
    },
    {
      subject: t('ANIMAL.ANIMAL_GROUPS'),
      type: FilterType.SEARCHABLE_MULTI_SELECT,
      filterKey: AnimalsFilterKeys.GROUPS,
      options: groups.map((group) => ({
        value: group.id,
        default: animalsFilter[AnimalsFilterKeys.GROUPS][group.id]?.active ?? false,
        label: group.name,
      })),
    },
    {
      subject: t('ANIMAL.ANIMAL_LOCATIONS'),
      type: FilterType.SEARCHABLE_MULTI_SELECT,
      filterKey: AnimalsFilterKeys.LOCATION,
      options: locations.map((location) => ({
        value: location.location_id,
        default: animalsFilter[AnimalsFilterKeys.LOCATION][location.location_id]?.active ?? false,
        label: location.name,
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

const filterShape = { active: PropTypes.bool, label: PropTypes.string, default: PropTypes.bool };

AnimalsFilterContent.propTypes = {
  animalsFilter: PropTypes.objectOf(PropTypes.shape(filterShape)).isRequired,
  filterContainerClassName: PropTypes.string,
  onChange: PropTypes.func,
};

export default AnimalsFilterContent;
