import PureHelpRequestPage from '../../components/Help';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  dismissHelpRequestModal,
  showHelpRequestModalSelector,
  postHelpRequestSuccess,
} from '../Home/homeSlice';
import { userFarmSelector } from '../userFarmSlice';
import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';
import RequestConfirmationComponent from '../../components/Modals/RequestConfirmationModal';
import { useAddSupportTicketMutation } from '../../store/api/supportTicketApi';

export default function HelpRequest({ closeDrawer }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [addSupportTicket, { isLoading }] = useAddSupportTicketMutation();

  const showHelpRequestModal = useSelector(showHelpRequestModalSelector);
  const showRequestConfirmationModalOnClick = () => dispatch(dismissHelpRequestModal());

  const handleSubmit = async (file, data, resetForm) => {
    const result = await addSupportTicket({ file, data });

    if (result.error) {
      console.error(result.error);
      dispatch(enqueueErrorSnackbar(t('message:HELP_REQUEST.ERROR.SEND')));
      return;
    }

    dispatch(postHelpRequestSuccess());
    resetForm();
    closeDrawer?.();
  };
  const onCancel = () => {
    closeDrawer?.();
  };

  const { email, phone_number } = useSelector(userFarmSelector);

  return (
    <>
      <PureHelpRequestPage
        onSubmit={handleSubmit}
        onCancel={onCancel}
        email={email}
        phoneNumber={phone_number}
        isLoading={isLoading}
      />
      {showHelpRequestModal && (
        <RequestConfirmationComponent
          onClick={showRequestConfirmationModalOnClick}
          dismissModal={showRequestConfirmationModalOnClick}
        />
      )}
    </>
  );
}
