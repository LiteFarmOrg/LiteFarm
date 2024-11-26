import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import Form from '../Form';
import Button from '../Form/Button';
import { Error } from '../Typography';
import ReactSelect from '../Form/ReactSelect';
import TextArea from '../Form/TextArea';
import Input from '../Form/Input';
import Radio from '../Form/Radio';
import { Label } from '../Typography/index';
import ImagePicker from '../ImagePicker';

export default function PureHelpRequestPage({ onSubmit, onCancel, email, phoneNumber, isLoading }) {
  const [file, setFile] = useState(null);
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  const { register, handleSubmit, watch, control, setValue, reset, formState } = useForm({
    mode: 'onTouched',
    defaultValues: {
      support_type: null,
      contact_method: 'email',
    },
  });

  const { errors, dirtyFields } = formState;

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

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  useEffect(() => {
    const contactInformation = contactMethodSelection === 'email' ? email : phoneNumber;
    setValue(CONTACT_INFO, contactInformation);
  }, [contactMethodSelection]);

  const submit = (data) => {
    data.support_type = data.support_type.value;
    data[data[CONTACT_METHOD]] = data.contactInfo;
    data.attachments = {};
    delete data.contactInfo;
    onSubmit(file, data);
    reset();
  };

  const supportType = watch(SUPPORT_TYPE);
  const message = watch(MESSAGE);
  const disabled = Object.keys(errors).length || !supportType || !message || formState.isSubmitting;

  return (
    <Form
      onSubmit={handleSubmit(submit, onError)}
      buttonGroup={
        <>
          <Button fullLength color={'secondary-cta'} onClick={handleCancel} md>
            {t('common:CANCEL')}
          </Button>
          <Button type={'submit'} disabled={isLoading || disabled} fullLength md>
            {isLoading ? t('common:SUBMITTING') : t('common:SUBMIT')}
          </Button>
        </>
      }
      fullWidthContent={true}
      classes={{
        container: {
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
          padding: '16px 24px 36px 24px',
        },
      }}
    >
      <div>
        <Controller
          control={control}
          name={SUPPORT_TYPE}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <ReactSelect
              label={t('HELP.TYPE_SUPPORT_LABEL')}
              placeholder={t('HELP.TYPE_SUPPORT_PLACEHOLDER')}
              options={supportTypeOptions}
              onChange={onChange}
              value={value}
            />
          )}
        />
        {errors[SUPPORT_TYPE] && SUPPORT_TYPE in dirtyFields ? (
          <Error>{t('HELP.REQUIRED_LABEL')}</Error>
        ) : (
          ''
        )}
      </div>
      <div>
        <TextArea
          label={t('HELP.MESSAGE_LABEL')}
          hookFormRegister={register(MESSAGE, { required: true })}
        />
        {errors[MESSAGE] && MESSAGE in dirtyFields ? <Error>{t('HELP.REQUIRED_LABEL')}</Error> : ''}
      </div>
      <div>
        <ImagePicker
          label={t('HELP.ATTACHMENT_LABEL')}
          onSelectImage={setFile}
          onRemoveImage={() => setFile(null)}
        />
      </div>
      <div>
        <Label>{t('HELP.PREFERRED_CONTACT')}</Label>
        <div className={styles.contactMethods}>
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
        </div>
      </div>
      <div>
        <Input
          label={
            contactMethodSelection === 'email' ? t('HELP.EMAIL') : t('HELP.WHATSAPP_NUMBER_LABEL')
          }
          hookFormRegister={register(CONTACT_INFO, {
            required: true,
            pattern: contactMethodSelection === 'email' ? validEmailRegex : /./g,
          })}
        />
        {errors[CONTACT_INFO] &&
        CONTACT_INFO in dirtyFields &&
        errors[CONTACT_INFO].type !== 'pattern' ? (
          <Error>{t('HELP.REQUIRED_LABEL')}</Error>
        ) : (
          ''
        )}
        {errors[CONTACT_INFO]?.type === 'pattern' ? <Error>Invalid Email</Error> : ''}
      </div>
    </Form>
  );
}

PureHelpRequestPage.prototype = {
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  email: PropTypes.string,
  phoneNumber: PropTypes.string,
  isLoading: PropTypes.bool,
};
