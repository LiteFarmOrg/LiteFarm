import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import DateContainer from '../../Inputs/DateContainer';
import moment from 'moment';

export default function PureField({ onGoBack }) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, errors } = useForm({
    mode: 'onTouched',
  });
  const onError = (data) => {};
  const onSubmit = (data) => {};

  const [namesArray, setNamesArray] = useState([]);
  const [transitioning, setTransitioning] = useState(false);
  const FIELD_TYPE = 'field_type';
  const fieldTypeSelection = watch(FIELD_TYPE, 'transitioning');

  useEffect(() => {
    setNamesArray(['areaField', 'perimeterField', 'nameField']);
  });

  // const PERIMETERFIELD = 'perimeterField';
  // const perimeterField = watch(PERIMETERFIELD, false);
  // const perimeterInputRegister = register();

  return (
    <AreaDetailsLayout
      name={t('FARM_MAP.FIELD.NAME')}
      title={t('FARM_MAP.FIELD.TITLE')}
      onBack={onGoBack}
      onSubmit={onSubmit}
      onError={onError}
      namesArray={namesArray}
      additionalProperties={
        <div>
          <p style={{ marginBottom: '25px' }}>
            {t('FARM_MAP.FIELD.FIELD_TYPE')} <img src={Leaf} style={{ paddingLeft: '7px' }} />
          </p>
          <div>
            <Radio
              style={{ marginBottom: '25px', color: 'green !important' }}
              label={t('FARM_MAP.FIELD.NON_ORGANIC')}
              defaultChecked={true}
              inputRef={register({ required: true })}
              value={'nonorganic'}
              name={FIELD_TYPE}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '25px' }}
              label={t('FARM_MAP.FIELD.ORGANIC')}
              inputRef={register({ required: true })}
              value={'organic'}
              name={FIELD_TYPE}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '25px' }}
              label={t('FARM_MAP.FIELD.TRANSITIONING')}
              inputRef={register({ required: true })}
              value={'transitioning'}
              name={FIELD_TYPE}
            />
          </div>
          {fieldTypeSelection === 'transitioning' && (
            <DateContainer date={moment()} placeholder={t('FARM_MAP.FIELD.DATE')} />
          )}
        </div>
      }
    />
  );
}
