import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { locationEnum } from '../../../containers/Map/constants';
import { useForm } from 'react-hook-form';
import { Main } from '../../Typography';
import BackArrow from '../../../assets/images/miscs/arrow.svg';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import convert from 'convert-units';

const distanceOptions = {
  metric: 'm',
  imperial: 'ft',
};

export default function PureLineBox({
  typeOfLine,
  system,
  confirmLine,
  updateWidth,
  onClickTryAgain,
  onClickBack,
  locationData,
  ...props
}) {
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    formState: { isValid },
    trigger
  } = useForm({
    mode: 'onChange',
  });
  const [widthValue, setWidthValue] = useState('');
  const [riparianValue, setRiparianValue] = useState('');
  const { t } = useTranslation();
  const widthName = 'width_display';
  const riparianBuffer = 'buffer_width_display';
  const widthLabel =
    typeOfLine === locationEnum.watercourse
      ? t('FARM_MAP.LINE_DETAILS.WATERCOURSE')
      : t('FARM_MAP.LINE_DETAILS.BUFFER_ZONE_WIDTH');
  const title =
    typeOfLine === locationEnum.watercourse
      ? t('FARM_MAP.LINE_DETAILS.WATERCOURSE_TITLE')
      : t('FARM_MAP.LINE_DETAILS.BUFFER_TITLE');

  const transformToMeters = (value, updateFunction) => {
    if (distanceOptions[system] !== 'm') {
      const meterValue = convert(value).from(distanceOptions[system]).to('m');
      updateFunction(meterValue);
    } else {
      updateFunction(Number(value));
    }
  };

  const onSubmit = (data) => {
    const submitData = {
      ...data,
      width: widthValue,
      buffer_width: riparianValue,
    };
    confirmLine(submitData);
  };

  useEffect(() => {
    updateWidth(widthValue + riparianValue);
  }, [widthValue, riparianValue]);

  useEffect( () => {
    if(locationData.width) {
      setValue(widthName, locationData[widthName]);
      setValue(riparianBuffer, locationData[riparianBuffer]);
      setWidthValue(locationData?.width);
      setRiparianValue(locationData?.buffer_width);
      trigger();
    }
  }, [])

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
          <Input
            label={widthLabel}
            type="number"
            onChange={(e) => {
              transformToMeters(e.target.value, setWidthValue);
            }}
            unit={distanceOptions[system]}
            name={widthName}
            inputRef={register({ required: true })}
            errors={errors[widthName] && t('common:REQUIRED')}
          />
        </div>
        {typeOfLine === locationEnum.watercourse && (
          <div style={{ flexOrder: 2, minWidth: '48%', marginLeft: '16px' }}>
            <Input
              label={t('FARM_MAP.LINE_DETAILS.RIPARIAN_BUFFER')}
              type="number"
              unit={distanceOptions[system]}
              onChange={(e) => {
                transformToMeters(e.target.value, setRiparianValue);
              }}
              name={riparianBuffer}
              inputRef={register({ required: true })}
              errors={errors[riparianBuffer] && t('common:REQUIRED')}
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
