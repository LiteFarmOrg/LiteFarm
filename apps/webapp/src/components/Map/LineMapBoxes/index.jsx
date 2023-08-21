import React, { useEffect } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { locationEnum } from '../../../containers/Map/constants';
import { useForm } from 'react-hook-form';
import { Main } from '../../Typography';
import BackArrow from '../../../assets/images/miscs/arrow.svg';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import { watercourseEnum } from '../../../containers/constants';
import Unit from '../../Form/Unit';
import { line_width } from '../../../util/convert-units/unit';
import { cloneObject } from '../../../util';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../containers/userFarmSlice';
import { useMemo } from 'react';

export default function PureLineBox({
  typeOfLine,
  system,
  confirmLine,
  updateWidth,
  onClickTryAgain,
  onClickBack,
  locationData,
  onLineParameterChange,
  ...props
}) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    control,
    watch,
    trigger,

    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: cloneObject(locationData),
  });

  const { t } = useTranslation();
  const measurementUnit = useSelector(measurementSelector);
  const maxValue = useMemo(() => (measurementUnit === 'metric' ? 1600 : 5280), [measurementUnit]);

  const widthLabel =
    typeOfLine === locationEnum.watercourse
      ? t('FARM_MAP.LINE_DETAILS.WATERCOURSE')
      : t('FARM_MAP.LINE_DETAILS.BUFFER_ZONE_WIDTH');
  const title =
    typeOfLine === locationEnum.watercourse
      ? t('FARM_MAP.LINE_DETAILS.WATERCOURSE_TITLE')
      : t('FARM_MAP.LINE_DETAILS.BUFFER_TITLE');

  const onSubmit = (data) => {
    confirmLine(data);
  };

  const widthValue = watch(watercourseEnum.width);
  const bufferWidthValue = watch(watercourseEnum.buffer_width);

  useEffect(() => {
    trigger();
    updateWidth(
      (widthValue ? (widthValue <= maxValue ? widthValue : maxValue) : 0) +
        (bufferWidthValue ? (bufferWidthValue <= maxValue ? bufferWidthValue : maxValue) : 0),
    );
  }, [widthValue, bufferWidthValue]);

  useEffect(() => {
    if (isDirty) onLineParameterChange();
  }, [isDirty]);

  return (
    <div className={clsx(styles.box)} {...props}>
      <div style={{ flexOrder: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <img
            onClick={onClickBack}
            src={BackArrow}
            style={{ cursor: 'pointer', flexOrder: 1, paddingBottom: '24px' }}
          />
          <div style={{ flexOrder: 2, flexGrow: '5', paddingBottom: '24px' }}>
            <Main>{title}</Main>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ minWidth: typeOfLine === locationEnum.watercourse ? '48%' : '100%' }}>
          <Unit
            register={register}
            classes={{ container: { flexGrow: 1 }, errors: { position: 'relative' } }}
            label={widthLabel}
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
            mode={'onChange'}
            max={maxValue}
          />
        </div>
        {typeOfLine === locationEnum.watercourse && (
          <div style={{ flexOrder: 2, minWidth: '48%', marginLeft: '16px' }}>
            <Unit
              register={register}
              classes={{ container: { flexGrow: 1 }, errors: { position: 'relative' } }}
              label={t('FARM_MAP.LINE_DETAILS.RIPARIAN_BUFFER')}
              name={watercourseEnum.buffer_width}
              displayUnitName={watercourseEnum.buffer_width_unit}
              errors={errors[watercourseEnum.buffer_width]}
              unitType={line_width}
              system={system}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
              hookFromWatch={watch}
              control={control}
              required
              mode={'onChange'}
              max={maxValue}
            />
          </div>
        )}
      </div>
      <div style={{ flexOrder: 3, paddingTop: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <Button color={'secondary'} onClick={onClickTryAgain} sm>
            {t('FARM_MAP.DRAWING_MANAGER.REDRAW')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={!isValid} color={'primary'} sm>
            {t('common:CONFIRM')}
          </Button>
        </div>
      </div>
    </div>
  );
}
