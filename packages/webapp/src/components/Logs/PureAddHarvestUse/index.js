import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import Input from '../../Form/Input';
import { useTranslation } from 'react-i18next';
import SubmitButton from '../../ButtonGroup/SubmitButton';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';

export default function PureAddHarvestUse({
  title,
  onGoBack,
  defaultHarvestUseName,
  onSubmit,
  onDelete,
}) {
  const { t } = useTranslation();

  const {
    register,
    formState: { isDirty, isValid },
    handleSubmit,
  } = useForm({ mode: 'onChange' });
  const disabled = !isDirty || !isValid;
  return (
    <Form
      buttonGroup={
        !defaultHarvestUseName ? (
          <SubmitButton disabled={disabled} />
        ) : (
          <>
            <Button color={'secondary'} fullLength onClick={onDelete}>
              {t('common:DELETE')}
            </Button>
            <Button type={'submit'} color={'primary'} fullLength disabled={disabled}>
              {t('common:SAVE')}
            </Button>
          </>
        )
      }
      onSubmit={handleSubmit((data) => onSubmit(data?.harvestUseName))}
    >
      <PageTitle style={{ paddingBottom: '28px' }} title={title} onGoBack={onGoBack} />
      <Input
        hookFormRegister={register('harvestUseName', { required: true })}
        defaultValue={defaultHarvestUseName}
        label={t('LOG_HARVEST.CUSTOM_HARVEST_USE')}
      />
    </Form>
  );
}
