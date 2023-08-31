/*
 *  Copyright 2023 LiteFarm.org
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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import Input, { getInputErrors } from '../../Form/Input';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import { IconLink } from '../../Typography';
import { MdOutlineInventory2 } from 'react-icons/md';
import DeleteBox from '../../Task/TaskReadOnly/DeleteBox';

// onSubmit: should be used in Add, Edit view
// onClick: should be used in Read-only view
// defaultValue: should be used in Read-only, Edit view
const PureSimpleCustomType = ({
  handleGoBack,
  onSubmit,
  onClick,
  view,
  buttonText,
  pageTitle,
  inputLabel,
  customTypeRegister,
  defaultValue,
  onRetire = () => {},
  retireLinkText,
  retireHeader,
  retireMessage,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: { [customTypeRegister]: defaultValue || undefined },
  });
  const MAX_CHARS = 100;
  const readonly = view === 'read-only' || false;
  const disabledInput = readonly;

  return (
    <Form
      onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
      buttonGroup={
        <Button
          color={'primary'}
          fullLength
          disabled={!isValid}
          onClick={onClick ? onClick : undefined}
        >
          {buttonText}
        </Button>
      }
    >
      <PageTitle style={{ marginBottom: '20px' }} onGoBack={handleGoBack} title={pageTitle} />
      <Input
        style={{ marginBottom: '20px' }}
        label={inputLabel}
        hookFormRegister={register(customTypeRegister, {
          required: true,
          maxLength: {
            value: MAX_CHARS,
            message: t('common:CHAR_LIMIT_ERROR', { value: MAX_CHARS }),
          },
        })}
        name={customTypeRegister}
        errors={getInputErrors(errors, customTypeRegister)}
        optional={false}
        disabled={disabledInput}
      />
      <div style={{ marginTop: 'auto' }}>
        {readonly && !isDeleting && (
          <IconLink
            style={{ color: 'var(--grey600)' }}
            icon={
              <MdOutlineInventory2
                style={{
                  fontSize: '16px',
                  transform: 'translateY(3px)',
                }}
              />
            }
            onClick={() => setIsDeleting(true)}
            isIconClickable
          >
            {retireLinkText}
          </IconLink>
        )}

        {isDeleting && (
          <DeleteBox
            color="warning"
            onOk={onRetire}
            onCancel={() => setIsDeleting(false)}
            header={retireHeader}
            headerIcon={
              <MdOutlineInventory2 style={{ fontSize: '24px', transform: 'translateY(5px)' }} />
            }
            message={retireMessage}
            primaryButtonLabel={t('common:CONFIRM')}
          />
        )}
      </div>
    </Form>
  );
};

PureSimpleCustomType.propTypes = {
  handleGoBack: PropTypes.func,
  onSubmit: PropTypes.func,
  onClick: PropTypes.func,
  view: PropTypes.oneOf(['add', 'read-only', 'edit']),
  buttonText: PropTypes.string,
  pageTitle: PropTypes.string,
  inputLabel: PropTypes.string,
  customTypeRegister: PropTypes.string,
  defaultValue: PropTypes.string,
  onRetire: PropTypes.func,
  retireLinkText: PropTypes.string,
  retireHeader: PropTypes.string,
  retireMessage: PropTypes.string,
};

export default PureSimpleCustomType;
