import Form from '../Form';
import Button from '../Form/Button';
import {ReactComponent as AddFile} from './../../assets/images/help/AddFile.svg';
import React, {useState} from 'react';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import { useForm, Controller} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactSelect from "../Form/ReactSelect";
import TextArea from "../Form/TextArea";
import Input from "../Form/Input";
import Radio from "../Form/Radio";
import {Label} from '../Typography/index'

export default function PureHelpRequestPage({ onSubmit}) {
  const [file, setFile] = useState(null)
  const { register, handleSubmit, watch, control } = useForm();
  const CONTACT_METHOD = 'contact_method';
  const contactMethodSelection = watch(CONTACT_METHOD)
  const MESSAGE = 'message';
  const SUPPORT_TYPE = 'support_type';
  const CONTACT_INFO = 'contactInfo';
  const { t } = useTranslation();
  const supportTypeOptions = [
    {value: 'Request information', label: t('HELP.OPTIONS.REQUEST_INFO')},
    {value:'Report a bug', label: t('HELP.OPTIONS.REPORT_BUG')},
    {value:'Request a feature', label: t('HELP.OPTIONS.REQUEST_FEATURE')},
    {value: 'Other', label: t('HELP.OPTIONS.OTHER')}];

  const onError = (error) => { // Show inline errors
    console.log(error)
  };
  const submit = (data) => {
    data.support_type = data.support_type.value
    data[data[CONTACT_METHOD]] = data.contactInfo;
    data.attachments = {};
    delete data.contactInfo
    onSubmit(file, data);
  }
  const fileChangeHandler = (event) => {
    setFile(event.target.files[0]);
  }


  return (
    <Form
      onSubmit={handleSubmit(submit, onError)}
      buttonGroup={
        <>
          <Button fullLength color={'secondary'}>
            {t('common:CANCEL')}
          </Button>
          <Button type={'submit'} fullLength>
            {t('common:SUBMIT')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{t('HELP.TITLE')}</Title>
      <Controller
        control={control}
        name={SUPPORT_TYPE}
        rules={{required: true}}
        render={({ onChange, onBlur, value }) => (
          <ReactSelect
            label={t('HELP.TYPE_SUPPORT_LABEL')}
            placeholder={t('HELP.TYPE_SUPPORT_PLACEHOLDER')}
            options={supportTypeOptions}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <TextArea
        label={t('HELP.MESSAGE_LABEL')}
        inputRef={register({ required: true })}
        name={MESSAGE}
        style={{marginTop:'30px', marginBottom: '36px'}}
      />
      <div style={{display: "flex", flexDirection: "row", marginBottom: '36px'}}>
        <Input
          label={t('HELP.ATTACHMENT_LABEL')}
          optional={true}
          style={{flexGrow: 4}}
        />
        <div style={{flexGrow: 1, marginTop: "16px", marginLeft:"8px", marginRight:"-8px"}}>
          <label htmlFor="uploader">
           <AddFile  />
          </label>
          <input id="uploader" name="_file_" type="file" onChange={fileChangeHandler} style={{display: 'none'}} />
        </div>
      </div>
      <Label style={{marginBottom: '16px'}}>{t('HELP.PREFERRED_CONTACT')}</Label>
      <Radio label={t('HELP.EMAIL')}
             value={'email'}
             inputRef={register({ required: true })}
             name={CONTACT_METHOD}
             defaultChecked={true}
      />
      <Radio  label={t('HELP.WHATSAPP')}
              value={'whatsapp'}
              inputRef={register({ required: true })}
              name={CONTACT_METHOD}
      />
      <Input label={contactMethodSelection === 'email' ? t('HELP.EMAIL'): t('HELP.WHATSAPP_NUMBER_LABEL')} inputRef={register({required: true})} name={CONTACT_INFO} />

    </Form>
  );
}

PureHelpRequestPage.prototype = {
  onSubmit: PropTypes.func
};
