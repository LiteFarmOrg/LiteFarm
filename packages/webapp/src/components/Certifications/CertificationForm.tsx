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
import ReactSelect from '../Form/ReactSelect';
import ImagePicker from '../ImagePicker';
import FormNavigationButtons from '../Form/FormNavigationButtons';
import InputBaseLabel from '../Form/InputBase/InputBaseLabel';
import CertificationBanner from './CertificationBanner';
import styles from './index.module.scss';

const SYSTEM_TYPE_ID = 'system_type_id';
const IS_ACTIVE = 'is_active';
const CERTIFIER = 'certifier';
const CERTIFICATION_TYPE = 'certification_type';
const OTHER_CERTIFIER = 'other_certifier';
const CERTIFICATE_IDENTIFIER = 'certificationIdentifier';
const ISSUE_DATE = 'issue_date';
const VALID_UNTIL = 'valid_until';
const DOCUMENT_URL = 'certificate_document_url';

export type CertificationTypeOption = { value: string; label: string };

export type CertifierOption = { value: number; label: string };

interface SystemType {
  id: number;
  name: string;
  translation_key: string;
}

interface Certifier {
  certifier_id: number;
  system_type_id: number;
  certifier_name: string;
}

export type CertificationFormValues = {
  system_type_id: number | null;
  is_active: boolean;
  certification_type: string | null;
  certifier: CertifierOption | null;
  other_certifier: string;
  certificationIdentifier: string;
  issue_date: string | null;
  valid_until: string | null;
  certificate_document_url: File | null;
};

type CertificationFormProps = {
  systemTypes: SystemType[];
  certifiers: Certifier[];
  defaultValues?: Partial<CertificationFormValues>;
  onSubmit: (data: CertificationFormValues) => void;
  onBack: () => void;
};

const DEFAULT_VALUES: CertificationFormValues = {
  system_type_id: null,
  is_active: true,
  certification_type: null,
  certifier: null,
  other_certifier: '',
  certificationIdentifier: '',
  issue_date: null,
  valid_until: null,
  certificate_document_url: null,
};

const certificationTypes = [
  'ORGANIC',
  'BIODYNAMIC',
  'REGENERATIVE',
  'CERTIFIED_HUMANE',
  'FAIR_TRADE',
  'GRASSFED/PASTURE',
  'SUSTAINABILITY',
  'ANIMAL_WELFARE',
  'NON-GMO',
  'CARBON/CLIMATE',
];

export default function CertificationForm({
  systemTypes,
  certifiers,
  defaultValues,
  onSubmit,
  onBack,
}: CertificationFormProps) {
  const { t } = useTranslation(['translation', 'common']);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isValid },
  } = useForm<CertificationFormValues>({
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  });

  const systemTypeId = watch(SYSTEM_TYPE_ID);
  const isActive = watch(IS_ACTIVE);
  const watchedCertifier = watch(CERTIFIER);
  const showOtherCertifierInput = watchedCertifier?.value === 0;

  const pgsSystemType = systemTypes.find((type) => type.translation_key === 'PGS');
  const thirdPartySystemType = systemTypes.find(
    (type) => type.translation_key === 'THIRD_PARTY_ORGANIC',
  );

  const isThirdPartySystemType = systemTypeId !== pgsSystemType?.id;

  const certifierLabel = isThirdPartySystemType
    ? t('CERTIFICATION.FORM.CERTIFYING_BODY')
    : t('CERTIFICATION.FORM.CERTIFYING_GROUP');

  const identifierLabel = isThirdPartySystemType
    ? t('CERTIFICATION.FORM.CERTIFICATE_NUMBER')
    : t('CERTIFICATION.FORM.PGS_GROUP_NAME');

  const identifierPlaceholder = isThirdPartySystemType
    ? t('CERTIFICATION.FORM.CERTIFICATE_NUMBER_PLACEHOLDER')
    : t('CERTIFICATION.FORM.PGS_GROUP_NAME_PLACEHOLDER');

  const certifierPlaceHolder = isThirdPartySystemType
    ? t('CERTIFICATION.FORM.CERTIFYING_BODY_PLACEHOLDER')
    : t('CERTIFICATION.FORM.CERTIFYING_GROUP_PLACEHOLDER');

  const certifierInfo = isThirdPartySystemType
    ? t('CERTIFICATION.FORM.CERTIFYING_BODY_INFO')
    : t('CERTIFICATION.FORM.CERTIFYING_GROUP_INFO');

  const certifierOptions: CertifierOption[] = certifiers
    .filter((certifier) => certifier.system_type_id === systemTypeId)
    .map((certifier) => ({
      value: certifier.certifier_id,
      label: certifier.certifier_name,
    }))
    .concat([{ value: 0, label: t('common:OTHER') }]);

  // t('certifications:TYPES.ORGANIC')
  // t('certifications:TYPES.BIODYNAMIC')
  // t('certifications:TYPES.REGENERATIVE')
  // t('certifications:TYPES.CERTIFIED_HUMANE')
  // t('certifications:TYPES.FAIR_TRADE')
  // t('certifications:TYPES.GRASSFED/PASTURE')
  // t('certifications:TYPES.SUSTAINABILITY')
  // t('certifications:TYPES.ANIMAL_WELFARE')
  // t('certifications:TYPES.NON-GMO')
  // t('certifications:TYPES.CARBON/CLIMATE')
  const certificationTypeOptions: CertificationTypeOption[] = certificationTypes.map((type) => ({
    value: type,
    label: t(`certifications:TYPES.${type}`),
  }));

  const resetSystemTypeDependentFields = () => {
    if (getValues(CERTIFIER)?.value) {
      setValue(CERTIFIER, null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer} noValidate>
      <CertificationBanner />

      <div className={styles.formBody}>
        <h2 className={styles.formTitle}>{t('CERTIFICATION.FORM.TITLE')}</h2>

        <div>
          <InputBaseLabel label={t('CERTIFICATION.FORM.SYSTEM_TYPE')} />
          <RadioGroup
            hookFormControl={control}
            name={SYSTEM_TYPE_ID}
            variant="card"
            required={true}
            onChange={resetSystemTypeDependentFields}
            onBlur={undefined}
            style={undefined}
            radios={[thirdPartySystemType, pgsSystemType].filter(Boolean).map((systemType) => {
              const translationKey = systemType!.translation_key;
              return {
                label: t(`CERTIFICATION.SYSTEM_TYPE.${translationKey}`),
                value: systemType!.id,
                description: t(`CERTIFICATION.SYSTEM_TYPE.${translationKey}_DESCRIPTION`),
              };
            })}
          />
        </div>

        <div>
          <InputBaseLabel label={t('CERTIFICATION.FORM.CERTIFICATION_STATUS')} />
          <div className={styles.formStatusBox}>
            <Controller
              name={IS_ACTIVE}
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  leftLabel={t('CERTIFICATION.FORM.IS_ACTIVE')}
                />
              )}
            />
          </div>
        </div>

        <Controller
          name={CERTIFICATION_TYPE}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <ReactSelect
              label={t('CERTIFICATION.FORM.CERTIFICATION_TYPE')}
              placeholder={t('CERTIFICATION.FORM.CERTIFICATION_TYPE_PLACEHOLDER')}
              options={certificationTypeOptions}
              value={certificationTypeOptions.find((o) => o.value === field.value) ?? null}
              onChange={(option: CertificationTypeOption | null) =>
                field.onChange(option?.value ?? null)
              }
            />
          )}
        />

        <div>
          <Controller
            name={CERTIFIER}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <ReactSelect
                label={certifierLabel}
                placeholder={certifierPlaceHolder}
                options={certifierOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <p className={styles.formHelpText}>{certifierInfo}</p>
        </div>

        {showOtherCertifierInput && (
          <Input
            label={t('CERTIFICATION.FORM.OTHER_CERTIFIER')}
            hookFormRegister={register(OTHER_CERTIFIER, {
              required: true,
              shouldUnregister: true,
              setValueAs: (value) => value.trim(),
            })}
            placeholder={t('CERTIFICATION.FORM.OTHER_CERTIFIER_PLACEHOLDER')}
            optional
          />
        )}

        {isActive && (
          <>
            <Input
              label={identifierLabel}
              placeholder={identifierPlaceholder}
              hookFormRegister={register(CERTIFICATE_IDENTIFIER, {
                required: true,
                shouldUnregister: true,
                setValueAs: (value) => value.trim(),
              })}
            />
            <div className={styles.formDateRow}>
              <Input
                label={t('common:ISSUE_DATE')}
                type="date"
                hookFormRegister={register(ISSUE_DATE, { required: true, shouldUnregister: true })}
              />
              <Input
                label={t('common:VALID_UNTIL')}
                type="date"
                hookFormRegister={register(VALID_UNTIL, { required: true, shouldUnregister: true })}
              />
            </div>
            <Controller
              name={DOCUMENT_URL}
              control={control}
              render={({ field }) => (
                <ImagePicker
                  label={t('CERTIFICATION.CERTIFICATE_DOCUMENT')}
                  onSelectImage={(file) => field.onChange(file)}
                  onRemoveImage={() => field.onChange(null)}
                />
              )}
            />
          </>
        )}
      </div>

      <FormNavigationButtons
        isDisabled={!isValid}
        onCancel={onBack}
        onContinue={handleSubmit(onSubmit)}
        isFinalStep
        saveButtonContent={t('common:CONFIRM')}
      />
    </form>
  );
}
