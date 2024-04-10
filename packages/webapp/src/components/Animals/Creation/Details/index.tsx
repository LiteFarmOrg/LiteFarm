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

import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import GeneralDetails from './General';
import UniqueDetails from './Unique';
import OtherDetails from './Other';
import Origin from './Origin';
import ExpandableItem from '../../../Expandable/ExpandableItem';
import useExpandable from '../../../Expandable/useExpandableItem';
import { useCurrencySymbol } from '../../../../containers/hooks/useCurrencySymbol';
import { OrganicStatuses } from '../../../../types';
import styles from './styles.module.scss';
import {
  useGetAnimalIdentifierColorsQuery,
  useGetAnimalIdentifierPlacementsQuery,
  useGetAnimalOriginsQuery,
} from '../../../../store/api/apiSlice';

enum sectionKeys {
  GENERAL,
  ORIGIN,
  UNIQUE,
  OTHER,
}

// TODO
export type AnimalDetailsProps = {
  formProps: any;
};

// ===== Mock =====
// const sexesDB = [
//   { id: 1, key: 'MALE' },
//   { id: 2, key: 'FEMALE' },
// ];
// const sexOptions = [
//   ...sexesDB.map(({ id, key }) => ({ label: t(`ANIMAL.FILTER.${key}`), value: id })),
//   { label: t('common:DO_NOT_KNOW'), value: 'UNDEFINED' },
// ];

const sexOptions = [
  { value: 1, label: 'Male' },
  { value: 2, label: 'Female' },
  { value: 'undefined', label: `I don't know` },
];

const uses = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
];

const origins = [
  { id: 1, key: 'BROUGHT_IN' },
  { id: 2, key: 'BORN_AT_FARM' },
];

const AnimalDetails = ({ formProps }: AnimalDetailsProps) => {
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });
  const { t } = useTranslation(['translation', 'common']);

  // TODO: move up
  const currency = useCurrencySymbol();

  const originOptions = origins.map(({ id, key }) => ({
    value: id,
    label: t(`animal:ORIGIN.${key}`),
  }));

  const organicStatusOptions = [
    {
      label: t('common:NON_ORGANIC'),
      value: OrganicStatuses.NON_ORGANIC,
    },
    {
      label: t('common:ORGANIC'),
      value: OrganicStatuses.ORGANIC,
    },
    {
      label: t('common:TRANSITIONING'),
      value: OrganicStatuses.TRANSITIONAL,
    },
  ];

  const sections = [
    {
      key: sectionKeys.GENERAL,
      title: t('ANIMAL.ADD_ANIMAL.GENERAL_DETAILS'),
      Content: GeneralDetails,
      sectionProps: { sexes: sexOptions, uses },
    },
    {
      key: sectionKeys.UNIQUE,
      title: t('ANIMAL.ADD_ANIMAL.UNIQUE_DETAILS'),
      Content: UniqueDetails,
      sectionProps: {},
    },
    {
      key: sectionKeys.OTHER,
      title: t('ANIMAL.ADD_ANIMAL.OTHER_DETAILS'),
      Content: OtherDetails,
      sectionProps: { organicStatuses: organicStatusOptions },
    },
    {
      key: sectionKeys.ORIGIN,
      title: t('ANIMAL.ADD_ANIMAL.ORIGIN'),
      Content: Origin,
      sectionProps: { currency, originOptions },
    },
  ];

  return (
    <div className={styles.detailsWrapper}>
      {sections.map(({ key, title, Content, sectionProps }) => {
        const isExpanded = expandedIds.includes(key);

        return (
          <div key={key} className={clsx(styles.section, isExpanded && styles.expanded)}>
            <ExpandableItem
              itemKey={key}
              isExpanded={isExpanded}
              onClick={() => toggleExpanded(key)}
              mainContent={title}
              expandedContent={
                <div className={styles.expandedContentWrapper}>
                  <Content {...formProps} {...sectionProps} />
                </div>
              }
            />
          </div>
        );
      })}
    </div>
  );
};

export default AnimalDetails;
