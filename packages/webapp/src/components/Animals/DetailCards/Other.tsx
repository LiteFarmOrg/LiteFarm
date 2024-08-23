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

import { Controller, useController, useFormContext } from 'react-hook-form';
import ReactSelect from '../../Form/ReactSelect';
import Input from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import ImagePicker from '../../ImagePicker';
import { GetOnFileUpload } from '../../ImagePicker/useImagePickerUpload';
import { AnimalOrBatchKeys } from '../../../containers/Animals/types';
import styles from './styles.module.scss';
import {
  DetailsFields,
  type Option,
  type CommonDetailsProps,
} from '../../../containers/Animals/AddAnimals/types';

export type OtherDetailsProps = CommonDetailsProps & {
  organicStatusOptions: Option[DetailsFields.ORGANIC_STATUS][];
  animalOrBatch: AnimalOrBatchKeys;
  imageUploadTargetRoute: string;
  getOnFileUpload: GetOnFileUpload;
};

const OtherDetails = ({
  t,
  organicStatusOptions,
  animalOrBatch,
  namePrefix = '',
  imageUploadTargetRoute,
  getOnFileUpload,
}: OtherDetailsProps) => {
  const {
    control,
    resetField,
    register,
    formState: { errors },
  } = useFormContext();

  const { field } = useController({ control, name: `${namePrefix}${DetailsFields.ANIMAL_IMAGE}` });

  const handleSelectImage = (imageUrl: string) => {
    field.onChange(imageUrl);
  };

  const handleRemoveImage = () => {
    resetField(`${namePrefix}${DetailsFields.ANIMAL_IMAGE}`);
  };

  const onFileUpload = getOnFileUpload(imageUploadTargetRoute, handleSelectImage);

  return (
    <div className={styles.sectionWrapper}>
      {animalOrBatch === AnimalOrBatchKeys.ANIMAL && (
        <>
          {/* @ts-ignore */}
          <Input
            type="date"
            label={t('ANIMAL.ATTRIBUTE.WEANING_DATE')}
            hookFormRegister={register(`${namePrefix}${DetailsFields.WEANING_DATE}`)}
            optional
          />
        </>
      )}
      <Controller
        control={control}
        name={`${namePrefix}${DetailsFields.ORGANIC_STATUS}`}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('ANIMAL.ATTRIBUTE.ORGANIC_STATUS')}
            optional
            value={value}
            onChange={onChange}
            options={organicStatusOptions}
            placeholder={t('ADD_ANIMAL.PLACEHOLDER.ORGANIC_STATUS')}
          />
        )}
      />
      {/* @ts-ignore */}
      <InputAutoSize
        label={t(`ANIMAL.ATTRIBUTE.OTHER_DETAILS_${animalOrBatch.toUpperCase()}`)}
        hookFormRegister={register(`${namePrefix}${DetailsFields.OTHER_DETAILS}`, {
          maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
        })}
        optional
        placeholder={t('ADD_ANIMAL.PLACEHOLDER.OTHER_DETAILS')}
        errors={errors?.[`${namePrefix}${DetailsFields.OTHER_DETAILS}`]?.message}
      />
      <ImagePicker
        label={t(`ANIMAL.ATTRIBUTE.${animalOrBatch.toUpperCase()}_IMAGE`)}
        onFileUpload={onFileUpload}
        onRemoveImage={handleRemoveImage}
        shouldGetImageUrl={true}
        defaultUrl={field.value}
      />
    </div>
  );
};

export default OtherDetails;
