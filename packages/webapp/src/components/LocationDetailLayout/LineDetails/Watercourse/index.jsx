import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetails from '../LineDetails';
import { useForm, useFormContext } from 'react-hook-form';
import { Label } from '../../../Typography';
import {
  area_total_area,
  line_length,
  line_width,
  watercourse_width,
} from '../../../../util/convert-units/unit';
import Unit from '../../../Form/Unit';
import { watercourseEnum } from '../../../../containers/constants';
import RadioGroup from '../../../Form/RadioGroup';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureWatercourseWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureWatercourse {...props} />
    </PersistedFormWrapper>
  );
}

export function PureWatercourse({
  history,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  persistedFormData,
  useHookFormPersist,
  handleRetire,
  isAdmin,
}) {
  const onSubmit = (data) => {
    const usedForIrrigation = data[watercourseEnum.used_for_irrigation];
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
      type: 'watercourse',
      used_for_irrigation: usedForIrrigation,
    });
    formData[watercourseEnum.length_unit] = formData[watercourseEnum.length_unit]?.value;
    formData[watercourseEnum.width_unit] = formData[watercourseEnum.width_unit]?.value;
    formData[watercourseEnum.buffer_width_unit] =
      formData[watercourseEnum.buffer_width_unit]?.value;
    formData[watercourseEnum.total_area_unit] = formData[watercourseEnum.total_area_unit]?.value;
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      history={history}
      system={system}
      locationType={'watercourse'}
      locationCategory={'line'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'WATERCOURSE'}
      detailsChildren={
        <WatercourseDetailsChildren
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          system={system}
        />
      }
      tabs={['tasks', 'details']}
    />
  );
}

export function WatercourseDetailsChildren({ system, isViewLocationPage, isEditLocationPage }) {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <div>
        <Unit
          style={{ marginBottom: '40px', zIndex: 2 }}
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('FARM_MAP.WATERCOURSE.LENGTH')}
          name={watercourseEnum.length}
          displayUnitName={watercourseEnum.length_unit}
          errors={errors[watercourseEnum.length]}
          unitType={line_length}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={isViewLocationPage}
        />
      </div>
      <div
        style={{
          flexDirection: 'row',
          display: 'inline-flex',
          paddingBottom: '40px',
          width: '100%',
          gap: '16px',
        }}
      >
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          name={watercourseEnum.total_area}
          displayUnitName={watercourseEnum.total_area_unit}
          errors={errors[watercourseEnum.total_area]}
          unitType={area_total_area}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={isViewLocationPage}
        />
      </div>
      <div>
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1, marginBottom: '40px' } }}
          label={t('FARM_MAP.WATERCOURSE.WIDTH')}
          name={watercourseEnum.width}
          displayUnitName={watercourseEnum.width_unit}
          errors={errors[watercourseEnum.width]}
          unitType={line_width}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={!isEditLocationPage}
        />
      </div>
      <div>
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1, marginBottom: '40px' } }}
          label={t('FARM_MAP.WATERCOURSE.BUFFER')}
          name={watercourseEnum.buffer_width}
          displayUnitName={watercourseEnum.buffer_width_unit}
          errors={errors[watercourseEnum.buffer_width]}
          unitType={watercourse_width}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={!isEditLocationPage}
        />
      </div>
      <div>
        <div style={{ marginBottom: '20px' }}>
          <Label style={{ paddingRight: '10px', display: 'inline-block', fontSize: '16px' }}>
            {t('FARM_MAP.WATERCOURSE.IRRIGATION')}
          </Label>
          <Label style={{ display: 'inline-block' }} sm>
            {t('common:OPTIONAL')}
          </Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={watercourseEnum.used_for_irrigation}
            hookFormControl={control}
          />
        </div>
      </div>
    </div>
  );
}
