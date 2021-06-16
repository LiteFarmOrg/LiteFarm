import React from 'react';
import Input from '../../Form/Input';
import Form from '../../Form';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../Form/ReactSelect';
import Checkbox from '../../Form/Checkbox';
import InputAutoSize from '../../Form/InputAutoSize';
import Button from '../../Form/Button';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { AddLink } from '../../Typography'
import { ReactComponent as TrashIcon }  from '../../../assets/images/document/trash.svg';
import { Controller, useForm } from 'react-hook-form';

function PureAddDocumentView({ submit, onGoBack, onCancel, uploadImageOrDocument}) {
  const { t } = useTranslation();
  const typeOptions = [
    {label: t('DOCUMENT.TYPE.CLEANING_PRODUCT'), value: 'CLEANING_PRODUCT'},
    {label: t('DOCUMENT.TYPE.CROP_COMPLIANCE'), value: 'CROP_COMPLIANCE'},
    {label: t('DOCUMENT.TYPE.FERTILIZING_PRODUCT'), value: 'FERTILIZING_PRODUCT'},
    {label: t('DOCUMENT.TYPE.PEST_CONTROL_PRODUCT'), value: 'PEST_CONTROL_PRODUCT'},
    {label: t('DOCUMENT.TYPE.SOIL_AMENDMENT'), value: 'SOIL_AMENDMENT'},
    {label: t('DOCUMENT.TYPE.OTHER'), value: 'OTHER'},
  ];
  const NAME = 'name';
  const TYPE = 'type';
  const VALID_UNTIL = 'valid_until';
  const NOTES = 'notes';
  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
  });

  const deleteImage = () => {

  }

  return (
    <Form onSubmit={handleSubmit(submit)}   buttonGroup={
      <Button type={'submit'} disabled={false} fullLength>
        {t('common:SAVE')}
      </Button>
    }>
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        value={50}
        title={t('DOCUMENT.ADD.TITLE')}
        style={{ marginBottom: '24px' }}
      />
      <Input name={NAME} hookFormRegister={register(NAME, { required: true })} label={t('DOCUMENT.ADD.DOCUMENT_NAME')} classes={{container: { paddingBottom: '32px' } }} />
      <Controller
        control={control}
        name={TYPE}
        render={({ field: { onChange, onBlur, value } }) => (
          <ReactSelect
            optional
            options={typeOptions}
            label={t('DOCUMENT.ADD.TYPE')}
            value={value}
            onChange={(e) => {
              onChange(e);
            }}
            style={{ paddingBottom: '40px' }}
          />
          )}
      />
      <Input type={'date'} name={VALID_UNTIL}
             hookFormRegister={register(VALID_UNTIL)}
             label={t('DOCUMENT.ADD.VALID_UNTIL')} optional classes={{container: {paddingBottom: '18px' }}} />
      <Checkbox label={t('DOCUMENT.ADD.DOES_NOT_EXPIRE')} classes={{container: {paddingBottom: '42px'}}} />
      <div style={{width: '312px', height: '383px', margin: 'auto', paddingBottom: '16px'}}>
        <div style={{background: 'var(--teal700)', width: '24px', height:'24px', position: 'relative', float:'right', zIndex: 10 }} onClick={deleteImage}>
          <TrashIcon />
        </div>
        <img width={'100%'} style={{position: 'relative', top:'-24px', zIndex: 0}} height={'100%'} src={'https://litefarmbeta.nyc3.digitaloceanspaces.com/default_crop/default.jpg'} />
      </div>
      <AddLink style={{paddingBottom: '32px'}} onClick={uploadImageOrDocument}>{t('DOCUMENT.ADD.ADD_MORE_PAGES')}</AddLink>
      <InputAutoSize
        hookFormRegister={register(NOTES)}
        name={NOTES} label={t('common:NOTES')} optional classes={{container: { paddingBottom: '40px' } }} />
    </Form>
  )
}

export default PureAddDocumentView;