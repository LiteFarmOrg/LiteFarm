import React from 'react';
import CropHeader from '../CropHeader';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import { Label } from '../../Typography';
import Layout from '../../Layout';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import RouterTab from '../../RouterTab';
import { useForm } from 'react-hook-form';
import { seedYield } from '../../../util/convert-units/unit';
import { getDateInputFormat } from '../../../util/moment';
import Unit from '../../Form/Unit';
import InputAutoSize from '../../Form/InputAutoSize';
import Rating from '../../Rating';

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

  const title = plan?.name;
  const isValidDate =
    getDateInputFormat(plan?.abandon_date) !== 'Invalid date' ||
    getDateInputFormat(plan?.complete_date) !== 'Invalid date';
  const isSomethingElse =
    plan?.abandon_reason !== 'CROP_FAILURE' &&
    plan?.abandon_reason !== 'LABOUR_ISSUE' &&
    plan?.abandon_reason !== 'MARKET_PROBLEM' &&
    plan?.abandon_reason !== 'WEATHER' &&
    plan?.abandon_reason !== 'MACHINERY_ISSUE' &&
    plan?.abandon_reason !== 'SCHEDULING_ISSUE';

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
      abandon_date: isValidDate ? getDateInputFormat(plan?.abandon_date) : '',
      abandon_reason: isSomethingElse
        ? plan?.abandon_reason
        : t(`MANAGEMENT_PLAN.COMPLETE_PLAN.REASON.${plan?.abandon_reason}`),
      complete_date: isValidDate ? getDateInputFormat(plan?.complete_date) : '',
      complete_notes: plan?.complete_notes,
      notes: plan?.notes,
      crop_management_plan: {
        estimated_yield: plan?.estimated_yield,
        estimated_yield_unit: plan?.estimated_yield_unit,
      },
      harvested_to_date: plan?.harvested_to_date ?? 0,
      harvested_to_date_unit: null,
    },
    shouldUnregister: false,
    mode: 'onChange',
  });

  const isAbandoned = plan?.abandon_date ? true : false;
  const isCompleted = plan?.complete_date ? true : false;
  const DATE_OF_STATUS_CHANGE = isAbandoned ? 'abandon_date' : 'complete_date';
  const ABANDON_REASON = 'abandon_reason';
  const DATE = isAbandoned ? 'ABANDON_DATE' : 'COMPLETE_DATE';
  const COMPLETE_NOTES = 'complete_notes';
  const PLAN_NOTES = 'notes';
  const HARVESTED_TO_DATE = 'harvested_to_date';
  const HARVESTED_TO_DATE_UNIT = 'harvested_to_date_unit';
  const ESTIMATED_YIELD = `crop_management_plan.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `crop_management_plan.estimated_yield_unit`;

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
      <CropHeader onBackClick={onBack} variety={variety} />

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

      {(isAbandoned || isCompleted) && (
        <InputAutoSize
          style={{ marginBottom: '40px' }}
          label={t(`MANAGEMENT_PLAN.COMPLETE_PLAN.${DATE}`)}
          hookFormRegister={register(DATE_OF_STATUS_CHANGE)}
          errors={errors[DATE_OF_STATUS_CHANGE]?.message}
          disabled
        />
      )}

      {(isAbandoned || isCompleted) && (
        <div>
          <Rating
            className={styles.rating}
            style={{ marginBottom: '34px', width: '24px', height: '24px' }}
            label={t('MANAGEMENT_PLAN.RATE_THIS_MANAGEMENT_PLAN')}
            stars={plan.rating}
            viewOnly={true}
          />
        </div>
      )}

      {isAbandoned && (
        <InputAutoSize
          style={{ marginBottom: '40px' }}
          label={t('MANAGEMENT_PLAN.COMPLETE_PLAN.ABANDON_REASON')}
          hookFormRegister={register(ABANDON_REASON, {
            maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.NOTES_CHAR_LIMIT') },
          })}
          errors={errors[ABANDON_REASON]?.message}
          disabled
        />
      )}

      {(isAbandoned || isCompleted) && (
        <InputAutoSize
          style={{ marginBottom: '40px' }}
          label={
            isAbandoned
              ? t('MANAGEMENT_PLAN.COMPLETE_PLAN.ABANDON_NOTES')
              : t('MANAGEMENT_PLAN.COMPLETION_NOTES')
          }
          hookFormRegister={register(COMPLETE_NOTES, {
            maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.NOTES_CHAR_LIMIT') },
          })}
          errors={errors[COMPLETE_NOTES]?.message}
          disabled
        />
      )}

      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NOTES')}
        hookFormRegister={register(PLAN_NOTES, {
          maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.NOTES_CHAR_LIMIT') },
        })}
        optional
        errors={errors[PLAN_NOTES]?.message}
        disabled
      />

      <Unit
        style={{ marginBottom: '46px' }}
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

      <Unit
        style={{ marginBottom: '46px' }}
        register={register}
        unitType={seedYield}
        name={HARVESTED_TO_DATE}
        label={t('MANAGEMENT_PLAN.HARVEST_TO_DATE')}
        displayUnitName={HARVESTED_TO_DATE_UNIT}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        hookFormSetValue={setValue}
        system={system}
        disabled
        toolTipContent={t('MANAGEMENT_PLAN.HARVEST_TO_DATE_INFO')}
        required // just to not show (optional) in the label
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
