import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Semibold } from '../Typography';
import { colors } from '../../assets/theme';
import CancelFlowModal from '../Modals/CancelFlowModal';
import PropTypes from 'prop-types';

export function CancelButton({ onCancel, showConfirmCancelModal, setShowConfirmCancelModal }) {
  const { t } = useTranslation();
  return (
    <>
      {showConfirmCancelModal && (
        <CancelFlowModal
          dismissModal={() => setShowConfirmCancelModal(false)}
          handleCancel={onCancel}
        />
      )}
      <Semibold
        data-cy="cancel-flow"
        sm
        style={{ color: colors.teal700 }}
        onClick={() => setShowConfirmCancelModal(true)}
      >
        {t('common:CANCEL')}
      </Semibold>
    </>
  );
}

CancelButton.propTypes = {
  onCancel: PropTypes.func,
  showConfirmCancelModal: PropTypes.bool,
  setShowConfirmCancelModal: PropTypes.func,
};
