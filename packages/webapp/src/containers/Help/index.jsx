import PureHelpRequestPage from '../../components/Help';
import { useDispatch, useSelector } from 'react-redux';
import { supportFileUpload } from './saga';
import {
  isHelpLoadingSelector,
  startSendHelp,
  dismissHelpRequestModal,
  showHelpRequestModalSelector,
} from '../Home/homeSlice';
import { userFarmSelector } from '../userFarmSlice';
import RequestConfirmationComponent from '../../components/Modals/RequestConfirmationModal';

export default function HelpRequest({ closeDrawer }) {
  const dispatch = useDispatch();

  const showHelpRequestModal = useSelector(showHelpRequestModalSelector);
  const showRequestConfirmationModalOnClick = () => dispatch(dismissHelpRequestModal());

  const handleSubmit = (file, data, resetForm) => {
    dispatch(startSendHelp());
    dispatch(
      supportFileUpload({
        file,
        form: data,
        onSuccess: () => {
          resetForm();
          closeDrawer?.();
        },
      }),
    );
  };
  const onCancel = () => {
    closeDrawer?.();
  };

  const { email, phone_number } = useSelector(userFarmSelector);
  const loading = useSelector(isHelpLoadingSelector);
  return (
    <>
      <PureHelpRequestPage
        onSubmit={handleSubmit}
        onCancel={onCancel}
        email={email}
        phoneNumber={phone_number}
        isLoading={loading}
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
