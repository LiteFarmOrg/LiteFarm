/*
 *  Copyright 2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useTranslation } from 'react-i18next';
import { ReactComponent as Edit } from '../../../../assets/images/edit-02.svg';
import InFormButtons from '../../../Form/InFormButtons';
import Button from '../../../Form/Button';
import styles from '../styles.module.scss';

export type ButtonsProps = {
  isEditingProduct: boolean;
  isEditDisabled: boolean;
  isSaveDisabled: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
};

const Buttons = ({
  isEditingProduct,
  isEditDisabled,
  isSaveDisabled,
  onCancel,
  onEdit,
  onSave,
}: ButtonsProps) => {
  const { t } = useTranslation(['translation', 'common']);

  if (isEditingProduct) {
    return (
      <InFormButtons
        className={styles.inFormButtons}
        statusText={t('common:EDITING')}
        confirmText={t('ADD_PRODUCT.SAVE_PRODUCT')}
        onCancel={onCancel}
        informationalText={t('ADD_PRODUCT.BUTTON_WARNING')}
        isDisabled={isSaveDisabled}
        onConfirm={onSave}
      />
    );
  }

  return (
    <Button
      sm
      type="button"
      color="secondary"
      onClick={onEdit}
      className={styles.editButton}
      disabled={isEditDisabled}
    >
      <Edit />
      <span>{t('ADD_PRODUCT.EDIT_PRODUCT_DETAILS')}</span>
    </Button>
  );
};

export default Buttons;
