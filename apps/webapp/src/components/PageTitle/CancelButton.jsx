import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Semibold } from '../Typography';
import { colors } from '../../assets/theme';
import CancelFlowModal from '../Modals/CancelFlowModal';
import PropTypes from 'prop-types';

export function CancelButton({ onCancel, cancelModalTitle }) {
  const { t } = useTranslation();
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  return (
    <>
      {showConfirmCancelModal && (
        <CancelFlowModal
          dismissModal={() => setShowConfirmCancelModal(false)}
          handleCancel={onCancel}
          flow={cancelModalTitle}
        />
      )}
      <Semibold
        data-cy="cancel-flow"
        sm
        style={{ color: colors.teal700 }}
        onClick={() => (!!cancelModalTitle ? setShowConfirmCancelModal(true) : onCancel())}
      >
        {t('common:CANCEL')}
      </Semibold>
    </>
  );
}

CancelButton.prototype = {
  cancelModalTitle: PropTypes.string,
  onCancel: PropTypes.func,
};
