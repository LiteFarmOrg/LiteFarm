import React from 'react';
import Input from '../../../Form/Input';
const AddFarmForm = ({
}) => {
  return (
      <>
        <h4>Tell us about your farm</h4>
        <Input label={"Farm name"}/>
        <Input label={"Farm location"} children={<div style={{position: "absolute", right: 0}}>icon</div>}/>
        <p>Street address or comma separated latitude and longitude (e.g. 49.250945, -123.238492)</p>
      </>
  );
};

export default AddFarmForm;