import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '..';
import FormTitleLayout from '../../Form/FormTitleLayout';
import Button from '../../Form/Button';
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

  return (
    <FormTitleLayout
      onGoBack={onGoBack}
      onSubmit={handleSubmit(onSubmit, onError)}
      title={t('FARM_MAP.FIELD.TITLE')}
      style={{ flexGrow: 9, order: 2 }}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:CANCEL')}
          </Button>
          <Button type={'submit'} fullLength>
            {t('common:SAVE')}
          </Button>
        </>
      }
    >
      <AreaDetails
        name={t('FARM_MAP.FIELD.NAME')}
        onBack={onGoBack}
        children={
          <div>
            <p style={{ marginBottom: '25px' }}>
              {t('FARM_MAP.FIELD.FIELD_TYPE')} <img src={Leaf} />
            </p>
            <div>
              <Radio
                style={{ marginBottom: '25px' }}
                label={t('FARM_MAP.FIELD.NON_ORGANIC')}
                defaultChecked={true}
              />
            </div>
            <div>
              <Radio style={{ marginBottom: '25px' }} label={t('FARM_MAP.FIELD.ORGANIC')} />
            </div>
            <div>
              <Radio style={{ marginBottom: '25px' }} label={t('FARM_MAP.FIELD.TRANSITIONING')} />
            </div>
            <DateContainer date={moment()} placeholder={t('FARM_MAP.FIELD.DATE')} />
          </div>
        }
      />
    </FormTitleLayout>
  );
}
