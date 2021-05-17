import { useSelector } from "react-redux";
import PureCropDetail from "../../../components/Crop/detail";
import { cropVarietyByID, cropVarietySelector } from "../../cropVarietySlice";
import { useEffect, useState } from "react";

function CropDetail ({ history, match }) {
  const selectedCrop = useSelector(cropVarietySelector(match.params.variety_id));
  const [isEditing, setIsEditing] = useState(false);

  const submitForm = (data) => {
    console.log(data);
    setIsEditing(false);
  }

  const goBack = () => {
    history.push(`/crop_varieties/crop/${selectedCrop.crop_id}`)
  }

  useEffect(() => {
    console.log(selectedCrop);
  } , []);
  return (
    <>
      <PureCropDetail
        history={history}
        match={match}
        crop={selectedCrop}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        submitForm={submitForm}
        onBack={goBack}
      />
    </>
  )
}

export default CropDetail