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

import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PureAnimalDetails from '../../../components/Animals/AddAnimalsDetails';
import {
  useGetAnimalIdentifierColorsQuery,
  useGetAnimalIdentifierPlacementsQuery,
  useGetAnimalOriginsQuery,
} from '../../../store/api/apiSlice';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { AnimalOrigins, AnimalSexes } from '../types';
import {
  DetailsFields,
  FormMethods,
  type ReactSelectOption,
} from '../../../components/Animals/AddAnimalsDetails/type';

const generateOptions = <V extends number>(
  data: Record<string, any>[],
  format?: (key: string) => string,
  keyForValue: keyof Record<string, any> = 'id',
  keyForLabel: keyof Record<string, any> = 'key',
): ReactSelectOption<V>[] => {
  return data.map((item) => {
    return {
      value: item[keyForValue] as V,
      label: format ? format(item[keyForLabel]) : item[keyForLabel],
    };
  });
};

const findIdByKey = (array: { id: number; key: string }[], value: string): number | undefined => {
  const foundItem = array.find(({ key }) => key === value);
  return foundItem?.id;
};

// ===== Mock =====
const apiAnimalSexesMock = {
  data: [
    { id: 1, key: 'MALE' },
    { id: 2, key: 'FEMALE' },
  ],
};

const apiIdentifierTypesMock = {
  data: [
    { id: 1, key: 'EAR_TAG' },
    { id: 2, key: 'LEG_BAND' },
    { id: 3, key: 'OTHER' },
  ],
};

const apiIdentifierPlacementsMock = {
  data: [
    { id: 1, key: 'LEFT_EAR', identifier_type_id: 1 },
    { id: 2, key: 'RIGHT_EAR', identifier_type_id: 1 },
    { id: 3, key: 'LEFT_LEG', identifier_type_id: 2 },
    { id: 4, key: 'RIGHT_LEG', identifier_type_id: 2 },
    { id: 5, key: 'OTHER', identifier_type_id: 3 },
  ],
};

const apiOrganicStatusMock = [
  { id: 1, key: 'Non-Organic' },
  { id: 2, key: 'Organic' },
  { id: 3, key: 'Transitioning' },
];

const typeOptions = [
  { value: 'default_1', label: 'Cattle' },
  { value: 'default_2', label: 'Pig' },
  { value: 'default_3', label: 'Chicken' },
  { value: 'custom_1', label: 'Dog' },
];

const breedOptions = [
  { value: '1', label: 'Angus' },
  { value: '2', label: 'Cobb 5' },
];

const useOptions = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
];

export type AnimalDetailsProps = {
  formMethods: FormMethods;
};

const AnimalDetails = ({ formMethods }: AnimalDetailsProps) => {
  const { watch, setValue } = formMethods;
  const { t } = useTranslation(['common']);
  const currency = useCurrencySymbol();

  const { data: apiAnimalSexes = [] } = apiAnimalSexesMock; // TODO

  const { data: apiIdentifierColors = [] } = useGetAnimalIdentifierColorsQuery();
  const { data: apiIdentifierPlacements = [] } = apiIdentifierPlacementsMock; // TODO: useGetAnimalIdentifierPlacementsQuery();
  const { data: apiIdentifierTypes = [] } = apiIdentifierTypesMock; // TODO

  const { data: apiOrigins = [] } = useGetAnimalOriginsQuery();

  // GENERAL
  const sexOptions = [
    { value: 0, label: t('common:DO_NOT_KNOW') },
    ...generateOptions<number>(apiAnimalSexes, (key) => t(`animal:SEX.${key}`)),
  ];
  const sexId = watch(DetailsFields.SEX);
  const isMaleSelected = sexId === findIdByKey(apiAnimalSexes, AnimalSexes.MALE);

  // UNIQUE
  const tagColorOptions = generateOptions<number>(apiIdentifierColors, (key) =>
    t(`animal:TAG_COLOR.${key}`),
  );
  const tagTypeOptions = generateOptions<number>(apiIdentifierTypes, (key) =>
    t(key === 'OTHER' ? `common:OTHER` : `animal:TAG_TYPE.${key}`),
  );
  const tagPlacements = generateOptions(apiIdentifierPlacements, (key) =>
    t(key === 'OTHER' ? `common:OTHER` : `animal:TAG_PLACEMENT.${key}`),
  );

  const tagType = watch(DetailsFields.TAG_TYPE);
  const tagPlacement = watch(DetailsFields.TAG_PLACEMENT);

  const tagPlacementOptions = useMemo(() => {
    if (!tagType) {
      return tagPlacements;
    }

    const placementIdsForSelectedTagType = apiIdentifierPlacements
      .filter(({ identifier_type_id }) => identifier_type_id === tagType.value)
      .map(({ id }) => id);

    return tagPlacements.filter(({ value }) => placementIdsForSelectedTagType.includes(value));
  }, [tagType, tagPlacements]);

  useEffect(() => {
    if (tagType && tagPlacement) {
      const selectedTagPlacement = apiIdentifierPlacements.find(
        ({ id }) => id === tagPlacement.value,
      );

      if (selectedTagPlacement?.identifier_type_id !== tagType.value) {
        // resetField or setting undefined does not update the value of ReactSelect
        // https://github.com/JedWatson/react-select/issues/2846#issuecomment-407637156
        setValue(DetailsFields.TAG_PLACEMENT, null);
      }
    }
  }, [tagType, tagPlacement]);

  const shouldShowTagTypeInput = tagType?.value === findIdByKey(apiIdentifierTypes, 'OTHER');
  const shouldShowTagPlacementInput =
    tagPlacement?.value === findIdByKey(apiIdentifierPlacements, 'OTHER');

  // OTHER
  const organicStatusOptions = generateOptions(apiOrganicStatusMock, (key) => t(`common:${key}`));

  // ORIGIN
  const origins = generateOptions<number>(apiOrigins, (key) => t(`animal:ORIGIN.${key}`));
  const originId = watch(DetailsFields.ORIGIN);
  const origin = !originId
    ? undefined
    : originId === findIdByKey(apiOrigins, AnimalOrigins.BROUGHT_IN)
      ? AnimalOrigins.BROUGHT_IN
      : AnimalOrigins.BORN_AT_FARM;

  return (
    <PureAnimalDetails
      formMethods={formMethods}
      generalDetailProps={{
        typeOptions,
        breedOptions,
        sexOptions,
        useOptions,
        isMaleSelected,
      }}
      uniqueDetailsProps={{
        tagColorOptions,
        tagTypeOptions,
        tagPlacementOptions,
        shouldShowTagTypeInput,
        shouldShowTagPlacementInput,
      }}
      otherDetailsProps={{
        organicStatusOptions,
      }}
      originProps={{
        currency,
        originOptions: origins,
        origin,
      }}
    />
  );
};

export default AnimalDetails;
