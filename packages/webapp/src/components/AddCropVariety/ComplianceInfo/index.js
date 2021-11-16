import Button from '../../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { AddLink, Info, Label } from '../../Typography';
import Form from '../../Form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import RadioGroup from '../../Form/RadioGroup';
import Infoi from '../../Tooltip/Infoi';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';

export default function ComplianceInfo({
  onSubmit,
  onError,
  onGoBack,
  onCancel,
  persistedFormData,
  useHookFormPersist,
  match,
}) {
  const { t } = useTranslation(['translation', 'common', 'crop']);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: { ...persistedFormData },
  });
  const persistedPath = [`/crop/${match.params.crop_id}/add_crop_variety`];
  useHookFormPersist(getValues, persistedPath);

  const CERTIFIED_ORGANIC = 'organic';
  const COMMERCIAL_AVAILABILITY = 'searched';
  const GENETIC_EGINEERED = 'genetically_engineered';
  const TREATED = 'treated';

  const organic = watch(CERTIFIED_ORGANIC);
  const disabled = !isValid;

  const labelStyle = {
    paddingRight: '10px',
    fontSize: '16px',
    lineHeight: '20px',
    display: 'inline-block',
  };

  const progress = 66;

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:SAVE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        title={t('CROP.ADD_CROP')}
        value={progress}
        style={{
          marginBottom: '23px',
        }}
      />

      <div>
        <div style={{ marginBottom: '16px' }}>
          <Label style={labelStyle}>{t('CROP.IS_ORGANIC')}</Label>
          <img src={Leaf} style={{ display: 'inline-block' }} />
        </div>
      </div>
      <RadioGroup
        style={{ marginBottom: '16px' }}
        hookFormControl={control}
        name={CERTIFIED_ORGANIC}
        required
      />
      <div>
        {organic === false && (
          <div>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Label style={labelStyle}>
                  {t('CROP.PERFORM_SEARCH')}
                  {<img src={Leaf} style={{ marginLeft: '10px', display: 'inline-block' }} />}
                  {
                    <Infoi
                      style={{ marginLeft: '8px' }}
                      content={t('CROP.NEED_DOCUMENT_PERFORM_SEARCH')}
                    />
                  }
                </Label>
              </div>
            </div>
            <RadioGroup
              style={{ marginBottom: '16px' }}
              hookFormControl={control}
              name={COMMERCIAL_AVAILABILITY}
              required
            />
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Label style={labelStyle}>{t('CROP.IS_GENETICALLY_ENGINEERED')}</Label>
                <img src={Leaf} style={{ display: 'inline-block' }} />
                <Infoi
                  style={{ marginLeft: '8px' }}
                  content={t('CROP.NEED_DOCUMENT_GENETICALLY_ENGINEERED')}
                />
              </div>
            </div>
            <RadioGroup
              style={{ marginBottom: '16px' }}
              hookFormControl={control}
              name={GENETIC_EGINEERED}
              required
            />

            <div>
              <div style={{ marginBottom: '16px' }}>
                <Label style={labelStyle}>{t('CROP.TREATED')}</Label>
                <img src={Leaf} style={{ display: 'inline-block' }} />
                <Infoi style={{ marginLeft: '8px' }} content={t('CROP.NEED_DOCUMENT_TREATED')} />
              </div>
            </div>

            <RadioGroup hookFormControl={control} name={TREATED} required showNotSure />
          </div>
        )}
      </div>
      <div>
        {organic === true && (
          <div>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Label style={labelStyle}>{t('CROP.TREATED')}</Label>
                <img src={Leaf} style={{ display: 'inline-block' }} />
                <Infoi style={{ marginLeft: '8px' }} content={t('CROP.NEED_DOCUMENT_TREATED')} />
              </div>
            </div>
            <RadioGroup hookFormControl={control} name={TREATED} required showNotSure />
          </div>
        )}
      </div>

      {/* <div
        style={{
          marginTop: '17px',
          marginBottom: '3px',
          display: 'flex',
          width: 'fit-content',
          fontSize: '14px',
          color: 'var(--iconActive)',
          lineHeight: '18px',
          cursor: 'pointer',
        }}
        onClick={() => {}}
      >
        <AddLink>{t('CROP.ADD_COMPLIANCE_FILE')}</AddLink>
      </div>
      <div>
        <Info
          style={{
            fontSize: '11px',
            lineHeight: '16px',
          }}
        >
          {t('CROP.UPLOAD_LATER')}
        </Info>
      </div> */}
    </Form>
  );
}

ComplianceInfo.prototype = {
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  persistedFormData: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  match: PropTypes.object,
};
