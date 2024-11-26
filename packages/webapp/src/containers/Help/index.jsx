import PureHelpRequestPage from '../../components/Help';
import { useDispatch, useSelector } from 'react-redux';
import { supportFileUpload } from './saga';
import { isHelpLoadingSelector, startSendHelp } from '../Home/homeSlice';
import { userFarmSelector } from '../userFarmSlice';
import { useState } from 'react';

export default function HelpRequest({ closeDrawer }) {
  const dispatch = useDispatch();

  const handleSubmit = (file, data) => {
    dispatch(startSendHelp());
    dispatch(supportFileUpload({ file, form: data }));
  };
  const onCancel = () => {
    closeDrawer?.();
    setKey((prev) => prev + 1); // Remount form when closing drawer
  };

  const [key, setKey] = useState(0);

  const { email, phone_number } = useSelector(userFarmSelector);
  const loading = useSelector(isHelpLoadingSelector);
  return (
    <PureHelpRequestPage
      onSubmit={handleSubmit}
      onCancel={onCancel}
      email={email}
      phoneNumber={phone_number}
      isLoading={loading}
      key={key}
    />
  );
}
