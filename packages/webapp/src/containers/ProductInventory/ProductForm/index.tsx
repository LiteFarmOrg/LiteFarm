/*
 *  Copyright 2025 LiteFarm.org
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
import { TFunction, useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Drawer, { DesktopDrawerVariants } from '../../../components/Drawer';
import SoilAmendmentProductForm from '../ProductForm/SoilAmendmentProductForm';
import InFormButtons from '../../../components/Form/InFormButtons';
import TextButton from '../../../components/Form/Button/TextButton';
import { ReactComponent as EditIcon } from '../../../assets/images/edit.svg';
import { ReactComponent as CopyIcon } from '../../../assets/images/copy-01.svg';
import { ReactComponent as TrashIcon } from '../../../assets/images/animals/trash_icon_new.svg';
import { ProductType } from '../../../components/ProductInventory/types';
import { FormMode } from '..';
import styles from './styles.module.scss';

const renderDrawerTitle = (
  mode: ProductFormProps['mode'],
  onActionButtonClick: ProductFormProps['onActionButtonClick'],
  t: TFunction,
) => {
  if (mode === FormMode.READ_ONLY) {
    return (
      <div className={clsx(styles.buttons, styles.titleWrapper)}>
        <TextButton onClick={() => onActionButtonClick(FormMode.EDIT)}>
          <EditIcon />
        </TextButton>
        <TextButton onClick={() => onActionButtonClick(FormMode.DUPLICATE)}>
          <CopyIcon />
        </TextButton>
        <TextButton onClick={() => onActionButtonClick(FormMode.DELETE)}>
          <TrashIcon />
        </TextButton>
      </div>
    );
  }

  const text = {
    [FormMode.ADD]: t('ADD_PRODUCT.ADD_NEW_PRODUCT'),
    [FormMode.DUPLICATE]: t('common:DUPLICATING'),
    [FormMode.EDIT]: t('common:EDITING'),
    [FormMode.DELETE]: '',
  };

  return <div className={styles.titleWrapper}>{mode ? text[mode] : null}</div>;
};

const productFormMap = {
  [ProductType.SOIL_AMENDMENT]: SoilAmendmentProductForm,
};

interface ProductFormProps {
  isFormOpen: boolean;
  productFormType: ProductType | null;
  mode: FormMode | null;
  isSaveDisabled: boolean;
  onActionButtonClick: (action: Partial<FormMode>) => void;
  onSave: () => void;
  onClose: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  isFormOpen,
  productFormType,
  mode,
  isSaveDisabled,
  onActionButtonClick,
  onSave,
  onClose,
  onCancel,
}: ProductFormProps) {
  const { t } = useTranslation();

  const Component = productFormType ? productFormMap[productFormType] : null;

  return (
    <Drawer
      isOpen={isFormOpen && !!productFormType && !!mode}
      onClose={onClose}
      title={renderDrawerTitle(mode, onActionButtonClick, t)}
      addBackdrop={false}
      desktopVariant={DesktopDrawerVariants.SIDE_DRAWER}
      fullHeight={true}
      classes={{ desktopSideDrawerContainer: styles.sideDrawerContainer }}
    >
      <div className={styles.formWrapper}>
        {Component && <Component />}
        <InFormButtons
          className={styles.inFormButtons}
          statusText={t('common:EDITING')}
          confirmText={t('ADD_PRODUCT.SAVE_PRODUCT')}
          onCancel={onCancel}
          informationalText={t('ADD_PRODUCT.BUTTON_WARNING')}
          isDisabled={isSaveDisabled}
          onConfirm={onSave}
        />
      </div>
    </Drawer>
  );
}
