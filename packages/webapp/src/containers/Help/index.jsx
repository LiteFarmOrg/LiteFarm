import PureHelpRequestPage from '../../components/Help';
import { useDispatch, useSelector } from 'react-redux';
import { supportFileUpload } from './saga';
import { isHelpLoadingSelector, startSendHelp } from '../Home/homeSlice';
import { userFarmSelector } from '../userFarmSlice';

export default function HelpRequest({ closeDrawer }) {
  const dispatch = useDispatch();

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
    <PureHelpRequestPage
      onSubmit={handleSubmit}
      onCancel={onCancel}
      email={email}
      phoneNumber={phone_number}
      isLoading={loading}
    />
  );
}
