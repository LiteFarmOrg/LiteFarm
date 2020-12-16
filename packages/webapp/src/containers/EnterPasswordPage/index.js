import React, { useState } from 'react';
import PureEnterPasswordPage from '../../components/Signup/EnterPasswordPage';

function EnterPasswordPage({ title, onLogin, onGoBack }) {
  const [showResetModal, setShowResetModal] = useState(false);

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
