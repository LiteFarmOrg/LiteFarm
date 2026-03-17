/*
 *  Copyright 2025 LiteFarm.org
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
// TextArea is a JS component whose PropTypes don't map cleanly to TS; cast to avoid false positives.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import TextAreaBase from '../../Form/TextArea';
const TextArea = TextAreaBase as any;
import Button from '../../Form/Button';
import Switch from '../../Form/Switch';
import ImageUploadCapture from '../../ImageUploadCapture';
import { ReactComponent as LockIcon } from '../../../assets/images/lock-03.svg';
import styles from './styles.module.scss';

// TODO(developer): Replace LockIcon with the actual lock-01 SVG from Figma
// (Figma node: Property 1=lock-01, node-id 64483:149265)

export type FarmNoteFormValues = {
  note: string;
  isPrivate: boolean;
};

export type FarmNoteFormProps = {
  title: string;
  defaultValues?: Partial<FarmNoteFormValues> & { imageUrl?: string };
  onSubmit: (data: FarmNoteFormValues, imageFile: File | null) => void;
  onCancel: () => void;
  onClose: () => void;
};

export default function FarmNoteForm({
  title,
  defaultValues,
  onSubmit,
  onCancel,
  onClose,
}: FarmNoteFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting },
    setValue,
    watch,
  } = useForm<FarmNoteFormValues>({
    defaultValues: {
      note: defaultValues?.note ?? '',
      isPrivate: defaultValues?.isPrivate ?? false,
    },
  });

  const isPrivate = watch('isPrivate');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  const handleSelectImage = (file: File) => {
    setImageFile(file);
    setImageChanged(true);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageChanged(true);
  };

  const isSaveDisabled = (!isDirty && !imageChanged) || isSubmitting;

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data, imageFile);
  });

  return (
    <form className={styles.panel} onSubmit={handleFormSubmit} noValidate>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.headerClose}>
          <span className={styles.closeTxt}>{t('FARM_NOTE.CLOSE')}</span>
          {/* TODO(developer): Replace this × SVG with the actual close icon from Figma
              (Figma node I68412:163495;370:11691) */}
          <button
            className={styles.closeIconBtn}
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path
                d="M1 1l9 9M10 1L1 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <TextArea
          label={t('FARM_NOTE.NOTE_LABEL')}
          placeholder={t('FARM_NOTE.NOTE_PLACEHOLDER')}
          hookFormRegister={register('note')}
          rows={5}
        />

        <ImageUploadCapture
          onSelectImage={handleSelectImage}
          onRemoveImage={handleRemoveImage}
          selectedImageUrl={defaultValues?.imageUrl}
        />

        <div className={styles.privacyRow}>
          <div className={styles.privacyLabel}>
            <LockIcon className={styles.lockIcon} aria-hidden="true" />
            <span>{t('FARM_NOTE.KEEP_PRIVATE')}</span>
          </div>
          <Switch
            checked={isPrivate}
            onChange={(e) => setValue('isPrivate', e.target.checked, { shouldDirty: true })}
          />
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Button color="secondary-cta" type="button" sm fullLength onClick={onCancel}>
          {t('FARM_NOTE.CANCEL')}
        </Button>
        <Button color="primary" type="submit" sm fullLength disabled={isSaveDisabled}>
          {t('FARM_NOTE.SAVE_NOTE')}
        </Button>
      </div>
    </form>
  );
}
