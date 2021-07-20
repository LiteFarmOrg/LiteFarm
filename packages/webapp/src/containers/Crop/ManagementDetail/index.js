import PureManagementDetail from "../../../components/Crop/ManagementDetail";
import { cropVarietySelector } from '../../cropVarietySlice';
import { useDispatch, useSelector } from 'react-redux';

function ManagementDetail({ history, match }) {

  const variety_id = match.params.variety_id;
  console.log(variety_id);
  const variety = useSelector(cropVarietySelector(variety_id));

  return (
    <PureManagementDetail 
       variety={variety}
    />
  );
}

export default ManagementDetail;