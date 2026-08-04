import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import { fenceEnum as lineEnum } from '../../containers/constants';
import InputAutoSize from '../Form/InputAutoSize';
import { useFormContext } from 'react-hook-form';

export default function LineDetails({
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
        data-cy="lineDetails-name"
        label={name}
        type="text"
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(lineEnum.name, { required: true })}
        errors={errors[lineEnum.name] && t('common:REQUIRED')}
        showCross={false}
        disabled={isViewLocationPage}
      />
      {children}
      <InputAutoSize
        label={t('common:NOTES')}
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(lineEnum.notes, {
          maxLength: { value: 10000, message: t('FARM_MAP.NOTES_CHAR_LIMIT') },
        })}
        disabled={isViewLocationPage}
        optional
        errors={errors[lineEnum.notes]?.message}
      />
    </>
  );
}
