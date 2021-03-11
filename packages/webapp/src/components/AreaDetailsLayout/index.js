import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import FormTitleLayout from '../Form/FormTitleLayout';
import Button from '../Form/Button';
import { fieldEnum } from '../../containers/fieldSlice';
import { useSelector } from 'react-redux';
import { locationInfoSelector } from '../../containers/mapSlice';

export default function AreaDetailsLayout({
  name,
  title,
  additionalProperties,
  onSubmit,
  onError,
  isNameRequired,
  disabled,
  register,
  handleSubmit,
  showPerimeter,
  setValue,
  history,
  children,
}) {
  const { t } = useTranslation();
  const { area: defaultArea, perimeter: defaultPerimeter } = useSelector(locationInfoSelector);

  const onCancel = () => {
    history.push('/map');
  }

  const onBack = () => {
    history.push({
      pathname: '/map',
      isStepBack: true,
    });
  }

  return (
    <FormTitleLayout
      onGoBack={onBack}
      onSubmit={handleSubmit(onSubmit, onError)}
      title={title}
      style={{ flexGrow: 9, order: 2 }}
      buttonGroup={
        <>
          <Button onClick={onCancel} color={'secondary'} fullLength>
            {t('common:CANCEL')}
          </Button>
          <Button type={'submit'} disabled={disabled} fullLength>
            {t('common:SAVE')}
          </Button>
        </>
      }
    >
      <Input
        label={name + ' name'}
        type="text"
        optional={name === 'Farm site boundary' ? true : false}
        hookFormSetValue={name === 'Farm site boundary' ? setValue : null}
        style={{ marginBottom: '40px' }}
        name={fieldEnum.name}
        inputRef={register({ required: isNameRequired })}
      />
      <div>
        <Input
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          type="text"
          style={{ marginBottom: '40px', width: '50%', float: 'left' }}
          name={fieldEnum.total_area}
          inputRef={register({ required: true })}
          defaultValue={defaultArea}
        />
        {showPerimeter && (
          <Input
            label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
            type="text"
            style={{ marginBottom: '40px', width: '50%', paddingLeft: '10px' }}
            name={fieldEnum.perimeter}
            inputRef={register({ required: true })}
            defaultValue={defaultPerimeter}
          />
        )}
      </div>
      {children}
      <Input label={t('common:NOTES')} type="text" optional style={{ marginBottom: '40px' }} hookFormSetValue={setValue} />
    </FormTitleLayout>
  );
}
