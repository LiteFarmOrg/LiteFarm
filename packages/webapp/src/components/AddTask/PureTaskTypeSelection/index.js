import React from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';

const PureTaskTypeSelection = ({ onSubmit }) => {
  const { t } = useTranslation();

  return (
    <>
      <Form>
        <MultiStepPageTitle />
      </Form>
    </>
  );
};

export default PureTaskTypeSelection;
