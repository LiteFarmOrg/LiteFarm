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

import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import RadioGroup from '../Form/RadioGroup';
import Switch from '../Form/Switch';
import Select from '../Form/ReactSelect/Select';
import PureFilePickerWrapper from '../Form/FilePickerWrapper';
import FormNavigationButtons from '../Form/FormNavigationButtons';
import CertificationBanner from './CertificationBanner';
import styles from './index.module.scss';

export type CertificationTypeOption = { value: number; label: string };

export type CertifierOption = { value: number | null; label: string; key?: string };

export type CertificationFormValues = {
  systemType: 'third_party' | 'pgs';
  isActive: boolean;
  certificationTypeId: number | null;
  certifier: CertifierOption | null;
  otherCertifier: string;
  certificationIdentifier: string;
  startDate: string | null;
  expiryDate: string | null;
  documentFile: File | null;
};

type CertificationFormProps = {
  certificationTypeOptions: CertificationTypeOption[];
  certifierOptions: CertifierOption[];
  defaultValues?: Partial<CertificationFormValues>;
  onSubmit: (data: CertificationFormValues) => void;
  onBack: () => void;
};

const DEFAULT_VALUES: CertificationFormValues = {
  systemType: 'third_party',
  isActive: true,
  certificationTypeId: null,
  certifier: null,
  otherCertifier: '',
  certificationIdentifier: '',
  startDate: null,
  expiryDate: null,
  documentFile: null,
};

export default function CertificationForm({
  certificationTypeOptions,
  certifierOptions,
  defaultValues,
  onSubmit,
  onBack,
}: CertificationFormProps) {
  const { t } = useTranslation('translation');
  const { register, control, handleSubmit, watch } = useForm<CertificationFormValues>({
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  });

  const systemType = watch('systemType');
  const isActive = watch('isActive');
  const watchedCertifier = watch('certifier');
  const showOtherCertifierInput = watchedCertifier?.key === 'OTHER';

  const certifierLabel =
    systemType === 'pgs'
      ? t('CERTIFICATION.FORM.CERTIFYING_GROUP')
      : t('CERTIFICATION.FORM.CERTIFYING_BODY');

  const identifierLabel =
    systemType === 'pgs'
      ? t('CERTIFICATION.FORM.PGS_GROUP_NAME')
      : t('CERTIFICATION.FORM.CERTIFICATE_NUMBER');

  const allCertifierOptions: CertifierOption[] = [
    ...certifierOptions,
    { value: null, label: t('common:OTHER'), key: 'OTHER' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer} noValidate>
      <CertificationBanner />

      <RadioGroup
        hookFormControl={control}
        name="systemType"
        required={false}
        onChange={undefined}
        onBlur={undefined}
        style={undefined}
        radios={[
          { label: t('CERTIFICATION.FORM.THIRD_PARTY'), value: 'third_party' },
          { label: t('CERTIFICATION.FORM.PGS'), value: 'pgs' },
        ]}
      />

      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <Switch
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            label={t('CERTIFICATION.FORM.IS_ACTIVE')}
            isToggleVariant
          />
        )}
      />

      <Controller
        name="certificationTypeId"
        control={control}
        render={({ field }) => (
          <Select
            label={t('CERTIFICATION.FORM.CERTIFICATION_TYPE')}
            options={certificationTypeOptions}
            value={certificationTypeOptions.find((o) => o.value === field.value) ?? null}
            onChange={(option: CertificationTypeOption | null) =>
              field.onChange(option?.value ?? null)
            }
          />
        )}
      />

      <Controller
        name="certifier"
        control={control}
        render={({ field }) => (
          <Select
            label={certifierLabel}
            options={allCertifierOptions}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      {showOtherCertifierInput && (
        <Input
          hookFormRegister={register('otherCertifier', { shouldUnregister: true })}
          placeholder={t('CERTIFICATION.FORM.OTHER_CERTIFIER_PLACEHOLDER')}
          optional
        />
      )}

      {isActive && (
        <>
          <Input label={identifierLabel} hookFormRegister={register('certificationIdentifier')} />
          <Input
            label={t('CERTIFICATION.FORM.START_DATE')}
            type="date"
            hookFormRegister={register('startDate')}
          />
          <Input
            label={t('CERTIFICATION.FORM.EXPIRY_DATE')}
            type="date"
            hookFormRegister={register('expiryDate')}
          />
        </>
      )}

      <Controller
        name="documentFile"
        control={control}
        render={({ field }) => (
          <PureFilePickerWrapper
            accept=".pdf,.jpg,.jpeg,.png"
            className={styles.formFileArea}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              field.onChange(e.target.files?.[0] ?? null)
            }
          >
            <span>{t('CERTIFICATION.FORM.UPLOAD_DOCUMENT')}</span>
          </PureFilePickerWrapper>
        )}
      />

      <FormNavigationButtons onCancel={onBack} onContinue={handleSubmit(onSubmit)} isFinalStep />
    </form>
  );
}
