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
import { FormProvider, useForm } from 'react-hook-form';
import { TFunction, useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Drawer, { DesktopDrawerVariants } from '../../../components/Drawer';
import InFormButtons from '../../../components/Form/InFormButtons';
import TextButton from '../../../components/Form/Button/TextButton';
import SoilAmendmentProductForm from './SoilAmendmentProductForm';
import { ReactComponent as EditIcon } from '../../../assets/images/edit.svg';
import { ReactComponent as CopyIcon } from '../../../assets/images/copy-01.svg';
import { ReactComponent as TrashIcon } from '../../../assets/images/animals/trash_icon_new.svg';
import useSaveProduct from './useSaveProduct';
import { TASK_TYPES } from '../../Task/constants';
import { FormMode } from '..';
import { Product } from '../../../store/api/types';
import { ProductFormFields } from '../../../components/Task/AddSoilAmendmentProducts/types';
import styles from './styles.module.scss';

export const productFormMap = {
  [TASK_TYPES.SOIL_AMENDMENT]: SoilAmendmentProductForm,
};

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
    [FormMode.CREATE]: t('ADD_PRODUCT.ADD_NEW_PRODUCT'),
    [FormMode.ADD]: t('ADD_PRODUCT.ADD_NEW_PRODUCT'),
    [FormMode.DUPLICATE]: t('common:DUPLICATING'),
    [FormMode.EDIT]: t('common:EDITING'),
    [FormMode.DELETE]: '',
  };

  return <div className={styles.titleWrapper}>{mode ? text[mode] : null}</div>;
};

interface ProductFormProps {
  isFormOpen: boolean;
  productFormType: Product['type'] | null;
  mode: FormMode | null;
  onActionButtonClick: (action: Partial<FormMode>) => void;
  onCancel: () => void;
}

export default function ProductForm({
  isFormOpen,
  productFormType,
  mode,
  onActionButtonClick,
  onCancel,
}: ProductFormProps) {
  const { t } = useTranslation();
  const formMethods = useForm<ProductFormFields>({ mode: 'onBlur' });

  const saveProduct = useSaveProduct({ formMode: mode, productFormType });

  const onSave = () => {
    formMethods.handleSubmit((data) => {
      saveProduct?.(data, onCancel);
    })();
  };

  const Component: (({ mode }: { mode: FormMode | null }) => JSX.Element) | null = productFormType
    ? productFormMap[productFormType]
    : null;

  return (
    <Drawer
      isOpen={isFormOpen && !!productFormType && !!mode}
      onClose={onCancel}
      title={renderDrawerTitle(mode, onActionButtonClick, t)}
      addBackdrop={false}
      desktopVariant={DesktopDrawerVariants.SIDE_DRAWER}
      fullHeight={true}
      classes={{ desktopSideDrawerContainer: styles.sideDrawerContainer }}
    >
      <div className={styles.formWrapper}>
        {Component && (
          <FormProvider {...formMethods}>
            <Component mode={mode} />
          </FormProvider>
        )}
        <InFormButtons
          className={styles.inFormButtons}
          statusText={t('common:EDITING')}
          confirmText={t('ADD_PRODUCT.SAVE_PRODUCT')}
          onCancel={onCancel}
          informationalText={mode === FormMode.EDIT ? t('ADD_PRODUCT.BUTTON_WARNING') : undefined}
          isDisabled={!formMethods.formState.isValid}
          onConfirm={onSave}
        />
      </div>
    </Drawer>
  );
}
