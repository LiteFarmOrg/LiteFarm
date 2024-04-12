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

import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../../Form/ReactSelect';
import InputBaseLabel from '../../../Form/InputBase/InputBaseLabel';
import Input from '../../../Form/Input';
import InputAutoSize from '../../../Form/InputAutoSize';
import { AnimalOrBatchKeys } from '../../../../containers/Animals/types';
import styles from './styles.module.scss';

// TODO
type ReactSelectOption = {
  label: string;
  value: string | number;
};

// TODO
export type OtherDetailsProps = {
  control: any;
  register: any;
  watch: any;
  organicStatuses: ReactSelectOption[];
  animalOrBatch: AnimalOrBatchKeys;
};

// TODO: move up
export enum ADD_ANIMAL {
  WEANING_DATE = 'weaning_date',
  ORGANIC_STATUS = 'organic_status',
  OTHER_DETAILS = 'notes',
  ANIMAL_IMAGE = 'photo_url',
}

const OtherDetails = ({ control, register, organicStatuses, animalOrBatch }: OtherDetailsProps) => {
  const { t } = useTranslation(['translation', 'common']);

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
        hookFormRegister={register(ADD_ANIMAL.OTHER_DETAILS)}
        optional
        placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.OTHER_DETAILS')}
      />
      <div>
        <InputBaseLabel
          optional
          label={t(`ANIMAL.ATTRIBUTE.${animalOrBatch.toUpperCase()}_IMAGE`)}
        />
        {/* TODO: image picker*/}
      </div>
    </div>
  );
};

export default OtherDetails;
