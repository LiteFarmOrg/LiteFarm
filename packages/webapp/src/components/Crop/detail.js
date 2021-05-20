import CropHeader from './cropHeader';
import RouterTab from '../RouterTab';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../Form/Button';
import { ReactComponent as Leaf } from '../../assets/images/signUp/leaf.svg';
import { ReactComponent as Expense } from '../../assets/images/fieldCrops/expense.svg';
import { ReactComponent as Document } from '../../assets/images/fieldCrops/Document.svg';
import { Main, Title } from '../Typography';
import { useForm } from 'react-hook-form';
import RadioGroup from '../Form/RadioGroup';
import Form from '../Form';
import styles from './styles.module.scss';

function PureCropDetail({
  history,
  match,
  crop,
  variety,
  isEditing,
  setIsEditing,
  submitForm,
  onBack,
  isInterestedInOrganic,
}) {
  const { t } = useTranslation();
  const {
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({ mode: 'onChange', defaultValues: { ...variety } });
  const SEEDING_TYPE = 'seeding_type';
  const LIFECYCLE = 'lifecycle';
  const ORGANIC = 'organic';
  const TREATED = 'treated';
  const SEARCHED = 'searched';
  const GENETICALLY_ENGINEERED = 'genetically_engineered';
  const isOrganic = watch(ORGANIC);

  return (
    <Form
      onSubmit={handleSubmit(submitForm)}
      buttonGroup={
        <>
          {isEditing ? (
            <Button disabled={!isValid} fullLength>
              {t('common:UPDATE')}
            </Button>
          ) : (
            <>
              <Button color={'secondary'} fullLength>
                {t('common:RETIRE')}
              </Button>
              <Button onClick={() => setIsEditing(true)} fullLength>
                {t('common:EDIT')}
              </Button>
            </>
          )}
        </>
      }
    >
      <CropHeader
        onBackClick={onBack}
        crop_translation_key={crop.crop_translation_key}
        crop_variety_name={crop.crop_variety_name}
        crop_variety_photo_url={crop.crop_variety_photo_url}
        supplierName={variety.supplier}
      />
      {!isEditing && (
        <>
          <RouterTab
            classes={{ container: { margin: '24px 0 26px 0' } }}
            history={history}
            match={match}
            tabs={[
              {
                label: t('CROP_DETAIL.MANAGEMENT_TAB'),
                path: `/crop/${match.params.variety_id}/management`,
              },
              {
                label: t('CROP_DETAIL.DETAIL_TAB'),
                path: `/crop/${match.params.variety_id}/detail`,
              },
            ]}
          />
          <Button style={{ marginBottom: '16px', width: '100%' }} color={'success'}>
            <Expense style={{ marginRight: '8px' }} />
            {t('CROP_DETAIL.EXPENSE_RECORD')}
            <Leaf style={{ marginLeft: '14px' }} />
          </Button>
          <Button style={{ marginBottom: '32px', width: '100%' }} color={'success'}>
            <Document style={{ marginRight: '1px' }} /> {t('CROP_DETAIL.COMPLIANCE_DOC')}
            <Leaf style={{ marginLeft: '14px' }} />
          </Button>
        </>
      )}
      {isEditing && (
        <Title style={{ marginTop: '24px' }}>{t('CROP_DETAIL.EDIT_CROP_DETAIL')}</Title>
      )}

      <Main className={styles.labelToRadioDistance}>{t('CROP_DETAIL.SEED_SEEDLING')}</Main>
      <RadioGroup
        hookFormControl={control}
        name={SEEDING_TYPE}
        disabled={!isEditing}
        style={{ paddingBottom: '16px' }}
        radios={[
          { value: 'SEED', label: t('CROP_DETAIL.SEED') },
          {
            value: 'SEEDLING_OR_PLANTING_STOCK',
            label: t('CROP_DETAIL.SEEDLING'),
          },
        ]}
      />

      <Main className={styles.labelToRadioDistance}>{t('CROP_DETAIL.ANNUAL_PERENNIAL')}</Main>
      <RadioGroup
        hookFormControl={control}
        name={LIFECYCLE}
        disabled={!isEditing}
        style={{ paddingBottom: '16px' }}
        radios={[
          { value: 'ANNUAL', label: t('CROP_DETAIL.ANNUAL') },
          {
            value: 'PERENNIAL',
            label: t('CROP_DETAIL.PERENNIAL'),
          },
        ]}
      />

      {isInterestedInOrganic && (
        <>
          <Main className={styles.labelToRadioDistance}>
            {t('CROP_DETAIL.ORGANIC')}
            <Leaf style={{ marginLeft: '14px' }} />
          </Main>
          <RadioGroup
            disabled={!isEditing}
            style={{ paddingBottom: '16px' }}
            required={true}
            hookFormControl={control}
            name={ORGANIC}
          />
          {!variety?.organic && (
            <>
              <Main className={styles.labelToRadioDistance}>
                {t('CROP_DETAIL.COMMERCIAL_AVAILABILITY')}
                <Leaf style={{ marginLeft: '14px' }} />
              </Main>
              <RadioGroup
                disabled={!isEditing}
                style={{ paddingBottom: '16px' }}
                hookFormControl={control}
                name={SEARCHED}
              />
              <Main className={styles.labelToRadioDistance}>
                {t('CROP_DETAIL.GENETICALLY_ENGINEERED')}
                <Leaf style={{ marginLeft: '14px' }} />
              </Main>
              <RadioGroup
                disabled={!isEditing}
                style={{ paddingBottom: '16px' }}
                hookFormControl={control}
                name={GENETICALLY_ENGINEERED}
              />
            </>
          )}
          <Main className={styles.labelToRadioDistance}>
            {t('CROP_DETAIL.TREATED')}
            <Leaf style={{ marginLeft: '14px' }} />
          </Main>
          <RadioGroup disabled={!isEditing} hookFormControl={control} name={TREATED} showNotSure />
        </>
      )}
    </Form>
  );
}

export default PureCropDetail;
