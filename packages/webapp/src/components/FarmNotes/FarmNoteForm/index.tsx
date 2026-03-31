/*
 *  Copyright 2026 LiteFarm.org
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

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import TextArea from '../../Form/TextArea';
import Switch from '../../Form/Switch';
import InFormButtons from '../../Form/InFormButtons';
import ImageUploadCapture from '../../ImageUploadCapture';
import { ReactComponent as LockIcon } from '../../../assets/images/icon-privacy.svg';
import styles from './styles.module.scss';

export const FARM_NOTE_FIELDS = {
  NOTE: 'note',
  IS_PRIVATE: 'is_private',
} as const;

export type FarmNoteFormValues = {
  [FARM_NOTE_FIELDS.NOTE]: string;
  [FARM_NOTE_FIELDS.IS_PRIVATE]: boolean;
};

export type FarmNoteFormProps = {
  defaultValues?: Partial<FarmNoteFormValues> & { image_url?: string };
  onSubmit: (data: FarmNoteFormValues, imageFile: File | null | undefined) => void;
  onCancel: () => void;
};

export default function FarmNoteForm({ defaultValues, onSubmit, onCancel }: FarmNoteFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting },
    setValue,
    watch,
  } = useForm<FarmNoteFormValues>({
    mode: 'onChange',
    defaultValues: {
      [FARM_NOTE_FIELDS.NOTE]: defaultValues?.note ?? '',
      [FARM_NOTE_FIELDS.IS_PRIVATE]: defaultValues?.is_private ?? false,
    },
  });

  const isPrivate = watch(FARM_NOTE_FIELDS.IS_PRIVATE);

  const [imageFile, setImageFile] = useState<File | null | undefined>(undefined);
  const [imageChanged, setImageChanged] = useState(false);

  const handleSelectImage = (file: File) => {
    setImageFile(file);
    setImageChanged(true);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageChanged(true);
  };

  const isSaveDisabled = !isValid || (!isDirty && !imageChanged) || isSubmitting;

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data, imageFile);
  });

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        {/* @ts-expect-error */}
        <TextArea
          label={t('FARM_NOTE.NOTE_LABEL')}
          placeholder={t('FARM_NOTE.NOTE_PLACEHOLDER')}
          hookFormRegister={register(FARM_NOTE_FIELDS.NOTE, {
            required: true,
            setValueAs: (value) => value.trim(),
          })}
          rows={5}
        />

        <ImageUploadCapture
          label={t('FARM_NOTE.ATTACH_PHOTO')}
          optional
          onSelectImage={handleSelectImage}
          onRemoveImage={handleRemoveImage}
          defaultUrl={defaultValues?.image_url}
        />

        <div className={styles.privacyRow}>
          <div className={clsx(styles.privacyLabel, isPrivate && styles.active)}>
            <LockIcon className={styles.lockIcon} aria-hidden="true" />
            <span>{t('FARM_NOTE.PRIVATE_NOTE')}</span>
          </div>
          <Switch
            checked={isPrivate}
            onChange={(e) =>
              setValue(FARM_NOTE_FIELDS.IS_PRIVATE, e.target.checked, { shouldDirty: true })
            }
          />
        </div>
      </div>

      <InFormButtons
        equalWidth
        className={styles.inFormButtons}
        confirmText={t('FARM_NOTE.SAVE_NOTE')}
        confirmButtonColor="primary"
        onCancel={onCancel}
        onConfirm={handleFormSubmit}
        isDisabled={isSaveDisabled}
      />
    </div>
  );
}
