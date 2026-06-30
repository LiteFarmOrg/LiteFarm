import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import { gateEnum as pointEnum } from '../../containers/constants';
import InputAutoSize from '../Form/InputAutoSize';
import { useFormContext } from 'react-hook-form';

export default function PointDetails({
  name,
  children,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
}) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <Input
        data-cy="pointDetails-name"
        label={name}
        type="text"
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(pointEnum.name, { required: true })}
        errors={errors[pointEnum.name] && t('common:REQUIRED')}
        disabled={isViewLocationPage}
      />

      {children}
      <InputAutoSize
        label={t('common:NOTES')}
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(pointEnum.notes, {
          maxLength: { value: 10000, message: t('FARM_MAP.NOTES_CHAR_LIMIT') },
        })}
        disabled={isViewLocationPage}
        optional
        errors={errors[pointEnum.notes]?.message}
      />
    </>
  );
}
