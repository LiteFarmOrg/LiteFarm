import CropHeader from "./cropHeader";
import RouterTab from "../RouterTab";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Form/Button";
import { ReactComponent as Leaf } from '../../assets/images/signUp/leaf.svg';
import { ReactComponent as Expense } from '../../assets/images/fieldCrops/expense.svg';
import { ReactComponent as Document } from '../../assets/images/fieldCrops/Document.svg';
import { Main } from "../Typography";
import Radio from "../Form/Radio";
import { useForm } from "react-hook-form";
import RadioGroup from "../Form/RadioGroup";
import Form from "../Form";

function PureCropDetail({ history, match, crop, isEditing, setIsEditing, submitForm, onBack, isInterestedInOrganic}) {
  const { t } = useTranslation();
  const { register,
      handleSubmit,
      watch,
      control,
      formState: { errors, isValid },
  } = useForm({ mode: 'onChange'});
  const SEEDING_TYPE = 'seeding_type';
  const SUPPLIER = 'supplier';
  const LIFECYCLE = 'lifecycle';
  const ORGANIC = 'organic';
  const TREATED = 'treated';
  const SEARCHED = 'searched';
  const GENETICALLY_ENGINEERED = 'genetically_engineered';
  const isOrganic = watch(ORGANIC);
  const supplierName = watch(SUPPLIER, '');

  return (
    <Form onSubmit={handleSubmit(submitForm)} buttonGroup={(
      <>
        {
          isEditing ?
          <Button disabled={!isValid} fullLength>{t('common:UPDATE')}</Button>: (
            <>
              <Button color={'secondary'} fullLength>{t('common:RETIRE')}</Button>
              <Button  onClick={() => setIsEditing(true)} fullLength>{t('common:EDIT')}</Button>
            </>
          )
        }
      </>
    )}>
      <CropHeader onBackClick={onBack} crop_translation_key={crop.crop_translation_key} crop_variety_name={crop.crop_variety_name} supplierName={supplierName}  />
      {
        !isEditing && (
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
            <Button style={{marginBottom: '16px', width: '100%' }} color={'success'}>
              <Expense style={{ marginRight: '8px'}} />{t('CROP_DETAIL.EXPENSE_RECORD')}<Leaf style={{ marginLeft: '14px'}}  />
            </Button>
            <Button style={{marginBottom: '32px', width: '100%'}} color={'success'}>
              <Document style={{ marginRight: '1px'}} /> {t('CROP_DETAIL.COMPLIANCE_DOC')}<Leaf style={{ marginLeft: '14px'}}  />
            </Button>
          </>
        )
      }

      <Main style={{marginBottom: '18px', marginTop: '14px'}}>{t('CROP_DETAIL.SEED_SEEDLING')}</Main>
      <Radio disabled={!isEditing} value={'SEED'} hookFormRegister={register( SEEDING_TYPE, { required: true})} style={{marginBottom: '24px'}} label={t('CROP_DETAIL.SEED')} />
      <Radio disabled={!isEditing} value={'SEEDLING_OR_PLANTING_STOCK'} hookFormRegister={register( SEEDING_TYPE, { required: true})} style={{marginBottom: '24px'}} label={t('CROP_DETAIL.SEEDLING')} />

      <Main style={{marginBottom: '18px'}}>{t('CROP_DETAIL.ANNUAL_PERENNIAL')}</Main>
      <Radio disabled={!isEditing} value={'ANNUAL'} hookFormRegister={register( LIFECYCLE, { required: true})} style={{marginBottom: '16px'}} label={t('CROP_DETAIL.ANNUAL')} />
      <Radio disabled={!isEditing} value={'PERENNIAL'} hookFormRegister={register( LIFECYCLE, { required: true})} style={{marginBottom: '34px'}} label={t('CROP_DETAIL.PERENNIAL')} />

      <Main style={{marginBottom: '18px'}}>{t('CROP_DETAIL.ORGANIC')}<Leaf style={{ marginLeft: '14px'}}  /></Main>
      <RadioGroup disabled={!isEditing}  required={true} hookFormControl={control} name={ORGANIC} />
      {
        !isOrganic && isInterestedInOrganic && (
          <>
            <Main style={{marginBottom: '18px'}}>{t('CROP_DETAIL.COMMERCIAL_AVAILABILITY')}</Main>
            <RadioGroup disabled={!isEditing}  hookFormControl={control} name={SEARCHED} />
            <Main style={{marginBottom: '18px'}}>{t('CROP_DETAIL.GENETICALLY_ENGINEERED')}<Leaf style={{ marginLeft: '14px'}}  /></Main>
            <RadioGroup disabled={!isEditing}  hookFormControl={control} name={GENETICALLY_ENGINEERED} />
          </>
        )
      }

      <Main style={{marginBottom: '18px'}}>{t('CROP_DETAIL.TREATED')}<Leaf style={{ marginLeft: '14px'}}  /></Main>
      <RadioGroup disabled={!isEditing}  hookFormControl={control} name={TREATED} showNotSure />
    </Form>
  )
}

export default PureCropDetail;
