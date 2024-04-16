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

import { Controller, useController } from 'react-hook-form';
import { TFunction } from 'react-i18next';
import ReactSelect from '../../../Form/ReactSelect';
import Input from '../../../Form/Input';
import InputAutoSize from '../../../Form/InputAutoSize';
import ImagePicker from '../../../../containers/ImagePicker';
import { AnimalOrBatchKeys } from '../../../../containers/Animals/types';
import styles from './styles.module.scss';

// TODO
type ReactSelectOption = {
  label: string;
  value: string | number;
};

// TODO
export type OtherDetailsProps = {
  formMethods: {
    control: any;
    register: any;
    resetField: any;
    formState: { errors: any };
    // errors?: { [key in ADD_ANIMAL]?: { message: string } };
  };
  t: TFunction;
  organicStatuses: ReactSelectOption[];
  animalOrBatch: AnimalOrBatchKeys;
};

// TODO: move up
export enum ADD_ANIMAL {
  WEANING_DATE = 'weaning_date',
  ORGANIC_STATUS = 'organic_status',
  OTHER_DETAILS = 'notes',
  ANIMAL_IMAGE = 'image_file',
}

const OtherDetails = ({ t, formMethods, organicStatuses, animalOrBatch }: OtherDetailsProps) => {
  const {
    control,
    resetField,
    register,
    formState: { errors },
  } = formMethods;

  const { field } = useController({ control, name: ADD_ANIMAL.ANIMAL_IMAGE });

  const handleSelectImage = (imageFile: any) => {
    field.onChange(imageFile);
  };

  const handleRemoveImage = () => {
    resetField(ADD_ANIMAL.ANIMAL_IMAGE);
  };

  return (
    <div className={styles.sectionWrapper}>
      {animalOrBatch === AnimalOrBatchKeys.ANIMAL && (
        <>
          {/* @ts-ignore */}
          <Input
            type="date"
            label={t('ANIMAL.ATTRIBUTE.WEANING_DATE')}
            hookFormRegister={register(ADD_ANIMAL.WEANING_DATE)}
            optional
          />
        </>
      )}
      <Controller
        control={control}
        name={ADD_ANIMAL.ORGANIC_STATUS}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('ANIMAL.ATTRIBUTE.ORGANIC_STATUS')}
            optional
            value={value}
            onChange={onChange}
            options={organicStatuses}
            placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.ORGANIC_STATUS')}
          />
        )}
      />
      {/* @ts-ignore */}
      <InputAutoSize
        label={t(`ANIMAL.ATTRIBUTE.OTHER_DETAILS_${animalOrBatch.toUpperCase()}`)}
        hookFormRegister={register(ADD_ANIMAL.OTHER_DETAILS, {
          maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
        })}
        optional
        placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.OTHER_DETAILS')}
        errors={errors?.[ADD_ANIMAL.OTHER_DETAILS]?.message}
      />
      <ImagePicker
        label={t(`ANIMAL.ATTRIBUTE.${animalOrBatch.toUpperCase()}_IMAGE`)}
        onSelectImage={handleSelectImage}
        onRemoveImage={handleRemoveImage}
      />
    </div>
  );
};

export default OtherDetails;
