import Form from '../Form';
import Button from '../Form/Button';
import { ReactComponent as AddFile } from './../../assets/images/help/AddFile.svg';
import React, { useEffect, useState } from 'react';
import { Error, Title } from '../Typography';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../Form/ReactSelect';
import TextArea from '../Form/TextArea';
import Input from '../Form/Input';
import Radio from '../Form/Radio';
import { Label } from '../Typography/index';

export default function PureHelpRequestPage({ onSubmit, goBack, email, phone_number, isLoading }) {
  const [file, setFile] = useState(null);
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  const { register, handleSubmit, watch, control, setValue, formState } = useForm({
    mode: 'onTouched',
    defaultValues: { 'contact_method': 'email' }
  });

  const { errors } = formState;

  const CONTACT_METHOD = 'contact_method';
  const contactMethodSelection = watch(CONTACT_METHOD);
  const MESSAGE = 'message';
  const SUPPORT_TYPE = 'support_type';
  const CONTACT_INFO = 'contactInfo';
  const { t } = useTranslation(['translation', 'common']);
  const supportTypeOptions = [
    { value: 'Request information', label: t('HELP.OPTIONS.REQUEST_INFO') },
    { value: 'Report a bug', label: t('HELP.OPTIONS.REPORT_BUG') },
    { value: 'Request a feature', label: t('HELP.OPTIONS.REQUEST_FEATURE') },
    { value: 'Other', label: t('HELP.OPTIONS.OTHER') },
  ];

  const onError = (error) => {
    console.log(error);
  };

  useEffect(() => {
    const contactInformation = contactMethodSelection === 'email' ? email : phone_number;
    setValue(CONTACT_INFO, contactInformation);
  }, [contactMethodSelection]);
  const submit = (data) => {
    data.support_type = data.support_type.value;
    data[data[CONTACT_METHOD]] = data.contactInfo;
    data.attachments = {};
    delete data.contactInfo;
    onSubmit(file, data);
  };
  const fileChangeHandler = (event) => {
    setFile(event.target.files[0]);
  };
  const supportType = watch(SUPPORT_TYPE);
  const message = watch(MESSAGE);
  const disabled = Object.keys(errors).length || !supportType || !message || formState.isSubmitting;
  return (
    <Form
      onSubmit={handleSubmit(submit, onError)}
      buttonGroup={
        <>
          <Button fullLength color={'secondary'} onClick={goBack}>
            {t('common:CANCEL')}
          </Button>
          <Button type={'submit'} disabled={isLoading || disabled} fullLength>
            {isLoading ? t('common:SUBMITTING') : t('common:SUBMIT')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{t('HELP.TITLE')}</Title>
      <Controller
        control={control}
        name={SUPPORT_TYPE}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <ReactSelect
            label={t('HELP.TYPE_SUPPORT_LABEL')}
            placeholder={t('HELP.TYPE_SUPPORT_PLACEHOLDER')}
            options={supportTypeOptions}
            onChange={onChange}
            value={value}
          />
        )}
      />
      {errors[SUPPORT_TYPE] ? <Error>{t('HELP.REQUIRED_LABEL')}</Error> : ''}
      <TextArea
        label={t('HELP.MESSAGE_LABEL')}
        hookFormRegister={register(MESSAGE, { required: true })}
        style={{ marginTop: '30px', marginBottom: '36px' }}
      />
      {errors[MESSAGE] ? (
        <Error style={{ marginTop: '-36px', marginBottom: '30px' }}>
          {t('HELP.REQUIRED_LABEL')}
        </Error>
      ) : (
        ''
      )}
      <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '36px' }}>
        <Input
          label={t('HELP.ATTACHMENT_LABEL')}
          optional={true}
          style={{ flexGrow: 4 }}
          disabled={!!file}
          value={file ? file.name : ''}
        />
        <div style={{ flexGrow: 1, marginTop: '21px', marginLeft: '8px', marginRight: '-8px' }}>
          <label htmlFor="uploader">
            <AddFile />
          </label>
          <input
            id="uploader"
            name="_file_"
            type="file"
            onChange={fileChangeHandler}
            style={{ display: 'none' }}
          />
        </div>
      </div>
      <Label style={{ marginBottom: '16px' }}>{t('HELP.PREFERRED_CONTACT')}</Label>
      <Radio
        label={t('HELP.EMAIL')}
        value={'email'}
        hookFormRegister={register(CONTACT_METHOD, { required: true })}
        defaultChecked={true}
      />
      <Radio
        label={t('HELP.WHATSAPP')}
        value={'whatsapp'}
        hookFormRegister={register(CONTACT_METHOD, { required: true })}
      />
      <Input
        label={
          contactMethodSelection === 'email' ? t('HELP.EMAIL') : t('HELP.WHATSAPP_NUMBER_LABEL')
        }
        hookFormRegister={register(CONTACT_INFO, {
          required: true,
          pattern: contactMethodSelection === 'email' ? validEmailRegex : /./g,
        })}
      />
      {errors[CONTACT_INFO] && errors[CONTACT_INFO].type !== 'pattern' ? (
        <Error>{t('HELP.REQUIRED_LABEL')}</Error>
      ) : (
        ''
      )}
      {errors[CONTACT_INFO]?.type === 'pattern' ? <Error>Invalid Email</Error> : ''}
    </Form>
  );
}

PureHelpRequestPage.prototype = {
  onSubmit: PropTypes.func,
};
