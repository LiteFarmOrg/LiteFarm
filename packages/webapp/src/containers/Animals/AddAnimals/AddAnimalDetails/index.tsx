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

import { FieldArrayWithId, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { Info, Semibold } from '../../../../components/Typography';
import ExpandableItem from '../../../../components/Expandable/ExpandableItem';
import useExpandable from '../../../../components/Expandable/useExpandableItem';
import { AnimalFormHeaderItem } from '../../../../components/Animals/AddAnimalsForm/AnimalFormHeaderItem';
import AnimalDetails from '../../../../components/Animals/AddAnimalsDetails';
import BatchDetails from '../../../../components/Animals/AddBatchDetails';
import { useCurrencySymbol } from '../../../hooks/useCurrencySymbol';
import { useAnimalOptions } from '../useAnimalOptions';
import { STEPS } from '..';
import { DetailsFields } from '../types';
import { AddAnimalsFormFields } from '../types';
import { AnimalOrBatchKeys } from '../../types';
import { parseUniqueDefaultId } from '../../../../util/animal';
import { getDefaultAnimalIconName } from '../../Inventory/useAnimalInventory';
import usePopulateDetails from './usePopulateDetails';
import useImagePickerUpload from '../../../../components/ImagePicker/useImagePickerUpload';

type AnimalDetailsField = FieldArrayWithId<AddAnimalsFormFields, 'details'>;

const AddAnimalDetails = () => {
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });

  const { control, watch } = useFormContext<AddAnimalsFormFields>();

  const { fields, remove, replace } = useFieldArray({
    name: STEPS.DETAILS,
    control,
  });

  const { getOnFileUpload } = useImagePickerUpload();

  const onRemoveCard = (index: number): void => {
    remove(index);
  };

  const {
    defaultTypes,
    sexOptions,
    sexDetailsOptions,
    useOptions,
    tagTypeOptions,
    tagColorOptions,
    organicStatusOptions,
    originOptions,
  } = useAnimalOptions(
    'default_types',
    'sex',
    'sexDetails',
    'use',
    'tagType',
    'tagColor',
    'organicStatus',
    'origin',
  );

  /* Populate details form based on basics data */
  usePopulateDetails(replace);

  /* Render logic */
  const currency = useCurrencySymbol();

  const isAnimalField = (field: AnimalDetailsField) =>
    field.animal_or_batch === AnimalOrBatchKeys.ANIMAL;

  const generateExpandableItem = (
    fieldWithFieldArrayIndex: AnimalDetailsField & { fieldArrayIndex: number },
    index: number,
  ) => {
    const { fieldArrayIndex, ...field } = fieldWithFieldArrayIndex;
    const namePrefix = `${STEPS.DETAILS}.${fieldArrayIndex}.` as const;

    const isAnimal = isAnimalField(field);

    const isExpanded = expandedIds.includes(field.id);

    const watchedCount = watch(`${namePrefix}${DetailsFields.COUNT}`);

    const useOptionsForType = useOptions.find(
      ({ default_type_id }: { default_type_id: string | null }) =>
        default_type_id === `${parseUniqueDefaultId(field.type.value)}` || default_type_id === null,
    );

    const mainContent = (
      <AnimalFormHeaderItem
        showRemove={fields.length > 1}
        key={field.id}
        isExpanded={isExpanded}
        onRemove={() => onRemoveCard(fieldArrayIndex)}
        type={field.type.label}
        breed={field.breed?.label}
        totalCount={isAnimal ? animalCount : batchCount}
        number={index + 1}
        iconKey={getDefaultAnimalIconName(defaultTypes, parseUniqueDefaultId(field.type.value))}
        isBatch={!isAnimal}
        count={!isAnimal ? watchedCount : undefined}
        sex={sexOptions.label}
      />
    );

    const commonProps = {
      key: field.id,
      generalDetailProps: {
        sexOptions,
        sexDetailsOptions,
        useOptions: useOptionsForType.uses,
      },
      otherDetailsProps: {
        organicStatusOptions,
        getOnFileUpload,
        imageUploadTargetRoute: isAnimal ? 'animal' : 'animalBatch',
      },
      originProps: {
        currency: currency,
        originOptions,
      },
      namePrefix: namePrefix,
    };

    const expandedContent = isAnimal ? (
      <AnimalDetails {...commonProps} uniqueDetailsProps={{ tagTypeOptions, tagColorOptions }} />
    ) : (
      <BatchDetails {...commonProps} />
    );

    return (
      <div key={field.id}>
        <ExpandableItem
          itemKey={field.id}
          isExpanded={isExpanded}
          iconClickOnly={false}
          onClick={() => toggleExpanded(field.id)}
          mainContent={mainContent}
          expandedContent={expandedContent}
          classes={{
            expandedContainer: styles.expandedContainer,
            mainContentWithIcon: styles.expandableHeader,
            expandedMainContentWithIcon: styles.expandedHeader,
          }}
          leftCollapseIcon
        />
      </div>
    );
  };

  const animals: (AnimalDetailsField & { fieldArrayIndex: number })[] = [];
  const batches: (AnimalDetailsField & { fieldArrayIndex: number })[] = [];

  fields.forEach((animalOrBatch, index) => {
    const array = isAnimalField(animalOrBatch) ? animals : batches;
    array.push({ ...animalOrBatch, fieldArrayIndex: index });
  });

  const animalCount = animals.length;
  const batchCount = batches.length;

  return (
    <div className={styles.container}>
      {!!animalCount && <SectionHeader title={'ANIMAL.FILTER.INDIVIDUALS'} count={animalCount} />}

      {animals.map(generateExpandableItem)}

      {!!batchCount && <SectionHeader title={'ANIMAL.FILTER.BATCHES'} count={batchCount} />}

      {batches.map(generateExpandableItem)}
    </div>
  );
};

export default AddAnimalDetails;

const SectionHeader = ({ title, count }: { title: string; count: number }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.sectionHeader}>
      <Semibold>
        {t(title)} ({count})
      </Semibold>
      <Info>{t('ADD_ANIMAL.ADD_DETAILS_INFO')}</Info>
    </div>
  );
};
