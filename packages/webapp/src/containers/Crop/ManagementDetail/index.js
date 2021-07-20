import PureManagementDetail from "../../../components/Crop/ManagementDetail";
import { cropVarietySelector } from '../../cropVarietySlice';
import { isAdminSelector } from "../../userFarmSlice";
import { useSelector } from 'react-redux';

function ManagementDetail({ history, match }) {

  const variety_id = match.params.variety_id;
  const variety = useSelector(cropVarietySelector(variety_id));

  const isAdmin = useSelector(isAdminSelector);

  const onBack = () => {
    history.push(`/crop/${variety_id}/management`);
  }

  const onCopy = () => {
  }

  const onCompleted = () => {
    console.log("Go to LF-1645");
  }

  return (
    <PureManagementDetail 
      onBack={onBack}
      onCopy={onCopy}
      onCompleted={onCompleted}
      isAdmin={isAdmin}
      variety={variety}
    />
  );
}

export default ManagementDetail;