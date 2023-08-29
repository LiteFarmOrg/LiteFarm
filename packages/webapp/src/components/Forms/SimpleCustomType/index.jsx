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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import Input, { getInputErrors } from '../../Form/Input';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';

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
  inputMaxChars = 100,
}) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    register,
    formState: { errors, isValid, isDirty },
  } = useForm({
    mode: 'onChange',
    defaultValues: { [customTypeRegister]: defaultValue || undefined },
  });
  const readonly = view === 'read-only' || false;
  const disabledInput = readonly;
  const disabledButton = (!isValid || !isDirty) && !readonly;

  return (
    <Form
      onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
      buttonGroup={
        <Button
          color={'primary'}
          fullLength
          disabled={disabledButton}
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
            value: inputMaxChars,
            message: t('common:CHAR_LIMIT_ERROR', { value: inputMaxChars }),
          },
        })}
        name={customTypeRegister}
        errors={getInputErrors(errors, customTypeRegister)}
        optional={false}
        disabled={disabledInput}
      />
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
  inputMaxChars: PropTypes.number,
};

export default PureSimpleCustomType;
