import React, { useEffect, useState } from 'react';
import TitleLayout from '../../Layout/TitleLayout';
import DateContainer from '../../Inputs/DateContainer';
import ReactSelect from '../../Form/ReactSelect';
import TextArea from '../../../components/Form/TextArea';
import Form from '../../Form';
import styles from './styles.scss';

import Input from '../../Form/Input';
import LogFormOneCrop from '../../Forms/LogFormOneCrop';
import Unit from '../../Inputs/Unit';
import LogFooter from '../../LogFooter';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';

export default function PureHarvestLog({
  setCurrentDate,
  setNewDate,
  setDefaultDate,
  onGoBack,
  fields,
  crops,
  unit,
  defaultField,
}) {
  const { t } = useTranslation();

  let fieldOptions = fields.map(({ field_name, field_id }) => ({
    label: field_name,
    value: field_id,
  }));

  let cropOptions = crops.map(({ crop_common_name, crop_id }) => ({
    label: crop_common_name,
    value: crop_id,
  }));

  // const [field, setField] = useState(null);

  // useEffect(() => {
  //   const currentField = fields.find(({ field_id }) => {
  //     return defaultField ? defaultField.field_id === field_id : farm.user_id === user_id;
  //   });
  //   setField(
  //     defaultField
  //       ? {
  //           value: defaultField?.field_id,
  //           label: defaultField.field_name,
  //         }
  //       : {
  //           value: currentUser.user_id,
  //           label: `${currentUser.first_name} ${currentUser.last_name}`,
  //         },
  //   );
  // }, []);

  const { register, handleSubmit, watch, control, errors, setValue, clearErrors } = useForm({
    mode: 'onTouched',
  });

  const onSubmit = (data) => {};

  const onError = (data) => {};

  return (
    <TitleLayout onGoBack={onGoBack} title={t('LOG_HARVEST.TITLE')}>
      <DateContainer
        date={setCurrentDate}
        onDateChange={setNewDate}
        placeholder={t('LOG_COMMON.CHOOSE_DATE')}
        defaultDate={setDefaultDate}
      />
      <div style={{ marginTop: '24px' }} />
      <ReactSelect
        label={t('LOG_HARVEST.FIELD')}
        placeholder={t('LOG_HARVEST.FIELD_PLACEHOLDER')}
        options={fieldOptions}
        // onChange={setWorker}
        // value={field}
        style={{ marginBottom: '24px' }}
        // defaultValue={defaultWorker}
      />
      <ReactSelect
        label={t('LOG_HARVEST.CROP')}
        placeholder={t('LOG_HARVEST.CROP_PLACEHOLDER')}
        options={cropOptions}
        // onChange={setWorker}
        // value={field}
        style={{ marginBottom: '24px' }}
        // defaultValue={defaultWorker}
      />
      {/* <Form
        onSubmit={handleSubmit(onSubmit, onError)}
      > */}
      <Input
        label={t('LOG_COMMON.QUANTITY')}
        style={{ marginBottom: '24px' }}
        type="number"
        info={unit}
      />
      <div className={styles.noteContainer}>
        <TextArea label={t('common:NOTES')} />
      </div>
      {/* <LogFormOneCrop
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
      /> */}
      {/* <div className={styles.noteTitle}>
        {t('common:NOTES')}
        <div className={styles.noteContainer}>
          <Controller
            component={TextArea}
            defaultValue={formData.notes}
          />
        </div>
      </div>
      <LogFooter isHarvestLog={isHarvestLog} /> */}
      {/* </Form> */}
    </TitleLayout>
  );
}
