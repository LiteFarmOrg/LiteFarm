import React from 'react';
import CropHeader from '../cropHeader';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import { Label } from '../../Typography';
import Layout from '../../Layout';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import RouterTab from '../../RouterTab';
import { useForm } from 'react-hook-form';
import { seedYield } from '../../../util/unit';
import Unit from '../../Form/Unit';
import InputAutoSize from '../../Form/InputAutoSize';

export default function PureManagementDetail({
  onBack,
  variety,
  plan,
  isAdmin,
  history,
  match,
  system,
}) {
  const { t } = useTranslation();

  const title = plan.name;

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      notes: plan.notes,
      crop_management_plan: {
        estimated_yield: plan.estimated_yield,
        estimated_yield_unit: plan.estimated_yield_unit,
      },
    },
    shouldUnregister: false,
    mode: 'onChange',
  });
  const ESTIMATED_YIELD = `crop_management_plan.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `crop_management_plan.estimated_yield_unit`;
  const NOTES = 'notes';
  return (
    <Layout
      buttonGroup={
        isAdmin && (
          <>
            <Button
              fullLength
              onClick={() =>
                history.push(
                  `/crop/${match.params.variety_id}/management_plan/${match.params.management_plan_id}/edit`,
                )
              }
            >
              {t('common:EDIT')}
            </Button>
          </>
        )
      }
    >
      <CropHeader
        onBackClick={onBack}
        crop_translation_key={variety.crop_translation_key}
        crop_variety_name={variety.crop_variety_name}
        crop_variety_photo_url={variety.crop_variety_photo_url}
        supplier={variety.supplier}
      />

      <div className={styles.titlewrapper}>
        <Label className={styles.title} style={{ marginTop: '24px' }}>
          {title}
        </Label>
      </div>

      <RouterTab
        classes={{ container: { margin: '24px 0 26px 0' } }}
        history={history}
        tabs={[
          {
            label: t('MANAGEMENT_DETAIL.TASKS'),
            path: `/crop/${match.params.variety_id}/management_plan/${match.params.management_plan_id}/tasks`,
          },
          {
            label: t('MANAGEMENT_DETAIL.DETAILS'),
            path: `/crop/${match.params.variety_id}/management_plan/${match.params.management_plan_id}/details`,
          },
        ]}
      />

      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NOTES')}
        hookFormRegister={register(NOTES, {
          maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.NOTES_CHAR_LIMIT') },
        })}
        optional
        errors={errors[NOTES]?.message}
        disabled
      />

      <Unit
        register={register}
        label={t('MANAGEMENT_PLAN.ESTIMATED_YIELD')}
        name={ESTIMATED_YIELD}
        displayUnitName={ESTIMATED_YIELD_UNIT}
        unitType={seedYield}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        required={true}
        disabled={true}
      />
    </Layout>
  );
}

PureManagementDetail.prototype = {
  onBack: PropTypes.func,
  variety: PropTypes.object,
  plan: PropTypes.object,
  isAdmin: PropTypes.bool,
  history: PropTypes.object,
  match: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']).isRequired,
};
