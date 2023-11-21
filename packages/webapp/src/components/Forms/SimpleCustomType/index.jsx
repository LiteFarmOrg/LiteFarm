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
import InputAutoSize from '../../Form/InputAutoSize';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import { IconLink } from '../../Typography';
import { MdOutlineInventory2 } from 'react-icons/md';
import DeleteBox from '../../Task/TaskReadOnly/DeleteBox';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';
import { CUSTOM_DESCRIPTION, DESCRIPTION_MAX_CHARS } from './constants';

/**
 * React component for the addition of custom type with just a name field this form has add,
 * edit and read-only functionality.
 *
 * @param {Object} props - The component's props.
 * @param {function} props.handleGoBack - A callback function for handling the "Go Back" action.
 * @param {function} [props.onSubmit] - Used in edit and add view, a callback function for handling form submission.
 * @param {function} [props.onClick] - Used in read-only view, a callback function for handling button click.
 * @param {string} props.view - The view mode ('read-only', 'add' or 'edit').
 * @param {string} props.buttonText - The text to display on the main button.
 * @param {string} props.pageTitle - The title to display on the page.
 * @param {string} props.inputLabel - The label for the input field.
 * @param {string} props.nameFieldRegisterName - The name for registering the input field.
 * @param {Object} [props.typeDetails={}] - Used in read-only and edit view, the default values for the input and description field.
 * @param {function} [props.onRetire] - A callback function for retiring the custom type.
 * @param {string} [props.retireLinkText] - The text for the retirement link.
 * @param {string} [props.retireHeader] - The header text for the retirement confirmation box.
 * @param {string} [props.retireMessage] - The message text for the retirement confirmation box.
 * @param {number} [props.inputMaxChars=100] - The maximum number of characters allowed in the input field.
 * @param {function} [props.validateInput] - A custom validation function for the input field.
 * @param {function} [props.useHookFormPersist] - useHookFormPersist hook.
 * @param {function} [props.customFormFields] - A function to render additional form fields.
 * @param {Object} [props.customFieldsDefaultValues={}] - Default values for the additional fields.
 * @returns {JSX.Element} A React component representing the custom type form.
 */
const PureSimpleCustomType = ({
  handleGoBack,
  onSubmit,
  onClick,
  view,
  buttonText,
  pageTitle,
  inputLabel,
  descriptionLabel,
  nameFieldRegisterName,
  typeDetails,
  onRetire = () => {},
  retireLinkText,
  retireHeader,
  retireMessage,
  inputMaxChars = 100,
  validateInput,
  useHookFormPersist = () => ({}),
  customFormFields,
  customFieldsDefaultValues = {},
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    handleSubmit,
    register,
    control,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      [nameFieldRegisterName]: typeDetails?.name || undefined,
      [CUSTOM_DESCRIPTION]: typeDetails?.description || undefined,
      ...customFieldsDefaultValues,
    },
  });
  const readonly = view === 'read-only';
  const disabledInput = readonly;
  const disabledButton = (!isValid || !isDirty) && !readonly;
  const { historyCancel } = useHookFormPersist();

  // Separating these into separate vs prop rendered nodes prevents form submission onClick for noSubmitButton
  const noSubmitButton = (
    <Button
      color={'secondary'}
      fullLength
      disabled={disabledButton}
      onClick={onClick}
      type={'button'}
    >
      {buttonText}
    </Button>
  );
  const submitButton = (
    <Button color={'primary'} fullLength disabled={disabledButton} type={'submit'}>
      {buttonText}
    </Button>
  );

  return (
    <Form
      onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
      buttonGroup={
        <>
          {onClick && noSubmitButton}
          {onSubmit && submitButton}
        </>
      }
    >
      <PageTitle
        style={{ marginBottom: '20px' }}
        onGoBack={handleGoBack}
        title={pageTitle}
        onCancel={historyCancel}
      />
      <Input
        style={{ marginBottom: '20px' }}
        label={inputLabel}
        hookFormRegister={register(nameFieldRegisterName, {
          required: true,
          maxLength: hookFormMaxCharsValidation(inputMaxChars),
          validate: validateInput,
        })}
        name={nameFieldRegisterName}
        errors={getInputErrors(errors, nameFieldRegisterName)}
        optional={false}
        disabled={disabledInput}
        placeholder={inputLabel}
      />
      <InputAutoSize
        style={{ marginBottom: '20px' }}
        label={descriptionLabel}
        hookFormRegister={register(CUSTOM_DESCRIPTION, {
          maxLength: hookFormMaxCharsValidation(DESCRIPTION_MAX_CHARS),
        })}
        name={CUSTOM_DESCRIPTION}
        errors={errors[CUSTOM_DESCRIPTION]?.message}
        optional={true}
        disabled={disabledInput}
        minRows={3}
        placeholder={`${descriptionLabel} - ${t('common:MAX_CHARS', {
          value: DESCRIPTION_MAX_CHARS,
        })}`}
      />
      {customFormFields && customFormFields({ control, watch })}
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
  nameFieldRegisterName: PropTypes.string,
  typeDetails: PropTypes.object,
  onRetire: PropTypes.func,
  retireLinkText: PropTypes.string,
  retireHeader: PropTypes.string,
  retireMessage: PropTypes.string,
  inputMaxChars: PropTypes.number,
  validateInput: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  customFormFields: PropTypes.func,
  customFieldsDefaultValues: PropTypes.object,
};

export default PureSimpleCustomType;
