import Button from '../Form/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import navStyles from '@navStyles';

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
        <Button data-cy="createField-save" type={'submit'} disabled={disabled} fullLength>
          {t('common:SAVE')}
        </Button>
      )}
      {isViewLocationPage && isAdmin && (
        <>
          <Button
            onClick={onRetire}
            color={'secondary'}
            fullLength
            className={navStyles.hideWhenOffline}
          >
            {t('common:RETIRE')}
          </Button>
          <Button
            color={'primary'}
            onClick={onEdit}
            fullLength
            className={navStyles.hideWhenOffline}
          >
            {t('common:EDIT')}
          </Button>
        </>
      )}
      {isEditLocationPage && (
        <Button type={'submit'} disabled={disabled} fullLength>
          {t('common:UPDATE')}
        </Button>
      )}
    </>
  );
}
