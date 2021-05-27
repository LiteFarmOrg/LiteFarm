import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../Typography';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import RadioGroup from '../Form/RadioGroup';
import styles from './styles.module.scss';
import { ReactComponent as Individual } from '../../assets/images/plantingMethod/Individual.svg';
import { ReactComponent as Rows } from '../../assets/images/plantingMethod/Rows.svg';

import { ReactComponent as Beds } from '../../assets/images/plantingMethod/Beds.svg';
import { ReactComponent as Monocrop } from '../../assets/images/plantingMethod/Monocrop.svg';

export default function PurePlantingMethod({
  onSubmit,
  onError,
  onGoBack,
  onCancel,
  useHookFormPersist,
  persistedFormData,
  system,
}) {
  const { t } = useTranslation();
  const PLANTING_TYPE = 'planting_type';
  const BROADCAST = 'BROADCAST';
  const CONTAINER = 'CONTAINER';
  const BEDS = 'BEDS';
  const ROWS = 'ROWS';
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    setError,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: persistedFormData,
  });

  const in_ground = watch(PLANTING_TYPE);

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={15}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ marginBottom: '24px' }}>{t('MANAGEMENT_PLAN.PLANTING_METHOD')}</Main>
      <div className={styles.radioGroupContainer}>
        <RadioGroup
          hookFormControl={control}
          name={PLANTING_TYPE}
          radios={[
            {
              label: t('MANAGEMENT_PLAN.ROWS'),
              value: ROWS,
            },
            { label: t('MANAGEMENT_PLAN.BEDS'), value: BEDS },
            {
              label: t('MANAGEMENT_PLAN.CONTAINER'),
              value: CONTAINER,
            },
            { label: t('MANAGEMENT_PLAN.BROADCAST'), value: BROADCAST },
          ]}
          required
          style={{ paddingBottom: '16px' }}
        />
        <div className={styles.radioIconsContainer}>
          <Rows />
          <Beds />
          <Individual />
          <Monocrop />
        </div>
      </div>
    </Form>
  );
}

PurePlantingMethod.prototype = {
  history: PropTypes.object,
  match: PropTypes.object,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
};
