import Button from '../Form/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SubmitButton({
  disabled,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  onRetire,
  isAdmin,
  onEdit,
}) {
  const { t } = useTranslation();
  return (
    <>
      {isCreateLocationPage && (
        <Button type={'button'} disabled={disabled} fullLength>
          {t('common:SAVE')}
        </Button>
      )}
      {isViewLocationPage && isAdmin && (
        <>
          <Button onClick={onRetire} color={'secondary'} fullLength>
            {t('common:RETIRE')}
          </Button>
          <Button color={'primary'} onClick={onEdit} fullLength>
            {t('common:EDIT')}
          </Button>
        </>
      )}
      {isEditLocationPage && (
        <Button type={'button'} disabled={disabled} fullLength>
          {t('common:UPDATE')}
        </Button>
      )}
    </>
  );
}
