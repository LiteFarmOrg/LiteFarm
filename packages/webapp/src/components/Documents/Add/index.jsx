import Input from '../../Form/Input';
import Form from '../../Form';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../Form/ReactSelect';
import Checkbox from '../../Form/Checkbox';
import InputAutoSize from '../../Form/InputAutoSize';
import Button from '../../Form/Button';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import PageTitle from '../../PageTitle/v2';
import { Controller, useForm } from 'react-hook-form';
import FilePicker from '../../FilePicker';
import _isEqual from 'lodash-es/isEqual';

function PureDocumentDetailView({
  submit,
  onGoBack,
  useHookFormPersist,
  persistedFormData,
  isEdit,
  filePickerFunctions,
  isUploading,
}) {
  const { t } = useTranslation();
  const typeOptions = {
    CLEANING_PRODUCT: { label: t('DOCUMENTS.TYPE.CLEANING_PRODUCT'), value: 'CLEANING_PRODUCT' },
    CROP_COMPLIANCE: { label: t('DOCUMENTS.TYPE.CROP_COMPLIANCE'), value: 'CROP_COMPLIANCE' },
    FERTILIZING_PRODUCT: {
      label: t('DOCUMENTS.TYPE.FERTILIZING_PRODUCT'),
      value: 'FERTILIZING_PRODUCT',
    },
    INVOICES: { label: t('DOCUMENTS.TYPE.INVOICES'), value: 'INVOICES' },
    PEST_CONTROL_PRODUCT: {
      label: t('DOCUMENTS.TYPE.PEST_CONTROL_PRODUCT'),
      value: 'PEST_CONTROL_PRODUCT',
    },
    RECEIPTS: { label: t('DOCUMENTS.TYPE.RECEIPTS'), value: 'RECEIPTS' },
    SOIL_AMENDMENT: { label: t('DOCUMENTS.TYPE.SOIL_AMENDMENT'), value: 'SOIL_AMENDMENT' },
    SOIL_SAMPLE_RESULTS: {
      label: t('DOCUMENTS.TYPE.SOIL_SAMPLE_RESULTS'),
      value: 'SOIL_SAMPLE_RESULTS',
    },
    WATER_SAMPLE_RESULTS: {
      label: t('DOCUMENTS.TYPE.WATER_SAMPLE_RESULTS'),
      value: 'WATER_SAMPLE_RESULTS',
    },
    OTHER: { label: t('DOCUMENTS.TYPE.OTHER'), value: 'OTHER' },
  };

  const NAME = 'name';
  const TYPE = 'type';
  const VALID_UNTIL = 'valid_until';
  const NOTES = 'notes';
  const NO_EXPIRATION = 'no_expiration';

  const defaultData = persistedFormData
    ? {
        name: persistedFormData.name,
        type: typeOptions[persistedFormData.type],
        valid_until: persistedFormData.valid_until?.substring(0, 10),
        notes: persistedFormData.notes,
        files: persistedFormData.files,
        no_expiration: persistedFormData.no_expiration,
      }
    : {};

  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    mode: 'onBlur',
    shouldUnregister: false,
    defaultValues: defaultData,
  });

  const submitWithFiles = (data) => {
    const getDocumentThumbnailUrl = (files) => {
      for (const file of files) {
        if (file.thumbnail_url) return file.thumbnail_url;
      }
      return undefined;
    };
    let validUntil = data.valid_until ? data.valid_until : null;
    data.type = data.type ? data.type.value : data.type;
    validUntil = data.no_expiration ? null : validUntil;
    const noExpiration = !data?.valid_until ? true : data.no_expiration;
    submit({
      ...data,
      thumbnail_url: getDocumentThumbnailUrl(uploadedFiles),
      files: uploadedFiles.map((file, i) => ({
        ...file,
      })),
      no_expiration: noExpiration,
      valid_until: validUntil,
    });
  };

  const noExpirationChecked = watch(NO_EXPIRATION);

  const {
    persistedData: { uploadedFiles },
    historyCancel,
  } = useHookFormPersist(getValues);

  // This only works because if one were to delete the original file, uploading that same file would create a "new" file
  const isDirtyUploadedFiles = !_isEqual(defaultData.files, uploadedFiles);

  const disabled = isEdit
    ? !isValid || uploadedFiles?.length === 0 || !(isDirty || isDirtyUploadedFiles) || isUploading
    : !isValid || uploadedFiles?.length === 0;

  return (
    <Form
      onSubmit={handleSubmit(submitWithFiles)}
      buttonGroup={
        <Button type={'submit'} disabled={disabled} fullLength>
          {isEdit ? t('common:UPDATE') : t('common:SAVE')}
        </Button>
      }
    >
      {isEdit && (
        <PageTitle
          onGoBack={onGoBack}
          title={t('DOCUMENTS.EDIT_DOCUMENT')}
          style={{ marginBottom: '24px' }}
        />
      )}
      {!isEdit && (
        <MultiStepPageTitle
          onGoBack={onGoBack}
          onCancel={historyCancel}
          value={66}
          title={t('DOCUMENTS.ADD.TITLE')}
          style={{ marginBottom: '24px' }}
        />
      )}
      <Input
        name={NAME}
        hookFormRegister={register(NAME, { required: true })}
        label={t('DOCUMENTS.ADD.DOCUMENT_NAME')}
        classes={{ container: { paddingBottom: '40px' } }}
        errors={errors[NAME] && t('common:REQUIRED')}
      />
      <Controller
        control={control}
        name={TYPE}
        render={({ field: { onChange, onBlur, value } }) => (
          <ReactSelect
            optional
            options={Object.values(typeOptions)}
            label={t('DOCUMENTS.ADD.TYPE')}
            value={value}
            onChange={(e) => {
              onChange(e);
            }}
            style={{ paddingBottom: '40px' }}
          />
        )}
      />
      {!noExpirationChecked && (
        <Input
          type={'date'}
          name={VALID_UNTIL}
          hookFormRegister={register(VALID_UNTIL)}
          label={t('DOCUMENTS.ADD.VALID_UNTIL')}
          optional
          classes={{ container: { paddingBottom: '18px' } }}
        />
      )}
      <Checkbox
        hookFormRegister={register(NO_EXPIRATION)}
        label={t('DOCUMENTS.ADD.DOES_NOT_EXPIRE')}
        classes={{ container: { paddingBottom: '42px' } }}
      />
      <FilePicker
        uploadedFiles={uploadedFiles}
        linkText={t('DOCUMENTS.ADD.ADD_MORE_PAGES')}
        showLoading={isUploading}
        showUploader={!uploadedFiles || uploadedFiles?.length < 5}
        {...filePickerFunctions}
      />
      <InputAutoSize
        hookFormRegister={register(NOTES, {
          maxLength: { value: 10000, message: t('DOCUMENTS.NOTES_CHAR_LIMIT') },
        })}
        name={NOTES}
        label={t('common:NOTES')}
        optional
        classes={{ container: { paddingBottom: '40px' } }}
        errors={errors[NOTES]?.message}
      />
    </Form>
  );
}

export default PureDocumentDetailView;
