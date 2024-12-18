import CropHeader from './CropHeader';
import RouterTab from '../RouterTab';
import { useTranslation } from 'react-i18next';
import Button from '../Form/Button';
import { ReactComponent as Leaf } from '../../assets/images/signUp/leaf.svg';
import { Main, Title } from '../Typography';
import { useForm } from 'react-hook-form';
import RadioGroup from '../Form/RadioGroup';
import styles from './styles.module.scss';
import Layout from '../Layout';
import Input, { integerOnKeyDown } from '../Form/Input';
import { useNavigate, useParams } from 'react-router';

function PureCropDetail({ variety, isEditing, isInterestedInOrganic, onEdit, isAdmin, location }) {
  let navigate = useNavigate();
  let { variety_id } = useParams();
  const { t } = useTranslation();
  const { register, watch, control } = useForm({ mode: 'onChange', defaultValues: { ...variety } });
  const LIFECYCLE = 'lifecycle';
  const ORGANIC = 'organic';
  const TREATED = 'treated';
  const SEARCHED = 'searched';
  const GENETICALLY_ENGINEERED = 'genetically_engineered';
  const HS_CODE_ID = 'hs_code_id';
  const isOrganic = isEditing ? watch(ORGANIC) : variety.organic;

  return (
    <Layout
      buttonGroup={
        isAdmin && (
          <>
            {/*TODO: LF-2003 rework task/management plan/location/crop_variety soft delete*/}
            {/*<Button color={'secondary'} fullLength onClick={onRetire}>*/}
            {/*  {t('common:RETIRE')}*/}
            {/*</Button>*/}
            <Button onClick={onEdit} fullLength>
              {t('common:EDIT')}
            </Button>
          </>
        )
      }
    >
      <CropHeader onBackClick={() => navigate(-1)} variety={variety} />
      {!isEditing && (
        <>
          <RouterTab
            classes={{ container: { margin: '24px 0 26px 0' } }}
            tabs={[
              {
                label: t('CROP_DETAIL.MANAGEMENT_TAB'),
                path: `/crop/${variety_id}/management`,
                state: location?.state,
              },
              {
                label: t('CROP_DETAIL.DETAIL_TAB'),
                path: `/crop/${variety_id}/detail`,
                state: location?.state,
              },
            ]}
          />
        </>
      )}
      {isEditing && (
        <Title style={{ marginTop: '24px' }}>{t('CROP_DETAIL.EDIT_CROP_DETAIL')}</Title>
      )}

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
          {!isOrganic && (
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
      <Input
        label={t('CROP_DETAIL.HS_CODE')}
        style={{ paddingBottom: '32px', paddingTop: '24px' }}
        hookFormRegister={register(HS_CODE_ID, {
          valueAsNumber: true,
        })}
        type={'number'}
        onKeyDown={integerOnKeyDown}
        max={9999999999}
        disabled={!isEditing}
        optional
      />
    </Layout>
  );
}

export default PureCropDetail;
