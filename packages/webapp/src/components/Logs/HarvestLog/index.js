import PageTitle from '../../PageTitle';
import DateContainer from '../../Inputs/DateContainer';
import React from 'react';
import Input from '../../Form/Input';
import LogFormOneCrop from '../../Forms/LogFormOneCrop';
import Unit from '../../Inputs/Unit';
import TextArea from '../../Form/TextArea';
import LogFooter from '../../LogFooter';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';

export default function PureHarvestLog({ setCurrentDate, setNewDate, setDefaultDate }) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, control, errors, setValue, clearErrors } = useForm({
    mode: 'onTouched',
  });

  const onSubmit = (data) => {};

  const onError = (data) => {};

  return (
    <div className="page-container">
      <PageTitle backUrl="/new_log" title={t('LOG_HARVEST.TITLE')} />
      <DateContainer
        date={setCurrentDate}
        onDateChange={setNewDate}
        placeholder={t('LOG_COMMON.CHOOSE_DATE')}
        // defaultDate={setDefaultDate}
      />
      {/* <Form
        className={styles.formContainer}
        onSubmit={handleSubmit(onSubmit, onError)}
      >
      <LogFormOneCrop
        fields={fields}
        crops={crops}
        notesField={notesField}
        defaultField={formData.field}
        defaultCrop={formData.crop}
      />
      <Unit
        title={t('LOG_COMMON.QUANTITY')}
        type={quantity_unit}
        validate
        isHarvestLog={isHarvestLog}
        defaultValue={formData.quantity_kg}
      />
      <div className={styles.noteTitle}>
        {t('common:NOTES')}
        <div className={styles.noteContainer}>
          <Controller
            component={TextArea}
            defaultValue={formData.notes}
          />
        </div>
      </div>
      <LogFooter isHarvestLog={isHarvestLog} />
      </Form> */}
    </div>
  );
}
