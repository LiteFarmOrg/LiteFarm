import React, { useState } from 'react';
import PureEnterPasswordPage from '../../components/Signup/EnterPasswordPage';
import { useTranslation } from 'react-i18next';

function EnterPasswordPage({ title, onLogin, onGoBack }) {
  const [showResetModal, setShowResetModal] = useState(false);
  const { t } = useTranslation();

  const forgotPassword = () => {
    setShowResetModal(true);
  }

  const dismissModal = () => {
      setShowResetModal(false);
  }
  return (
    <>
    <PureEnterPasswordPage
        onLogin={onLogin}
        title={title}
        onGoBack={onGoBack}
        forgotPassword={forgotPassword}
        showModal={showResetModal}
        dismissModal={dismissModal}
    />
    </>
  );
}

export default EnterPasswordPage;
