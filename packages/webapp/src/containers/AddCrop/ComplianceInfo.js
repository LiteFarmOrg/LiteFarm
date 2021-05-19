import React from 'react';
import ComplianceInfo from '../../components/AddCrop/ComplianceInfo';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { newVarietalSelector, deleteVarietal } from '../cropVarietySlice';
import { postVarietal, postCropAndVarietal } from './saga';
import { bool } from 'prop-types';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';

function ComplianceInfoForm({ history, match }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  const CERTIFIED_ORGANIC = 'organic';
  const COMMERCIAL_AVAILABILITY = 'searched';
  const GENETIC_EGINEERED = 'genetically_engineered';
  const TREATED = 'treated';

  const organicRegister = register(CERTIFIED_ORGANIC, { required: true });
  const commAvailRegister = register(COMMERCIAL_AVAILABILITY);
  const geneticEngRegister = register(GENETIC_EGINEERED);
  const treatedRegister = register(TREATED);

  const organicSelection = watch(CERTIFIED_ORGANIC);
  const commAvail = watch(COMMERCIAL_AVAILABILITY);
  const geneticEngineered = watch(GENETIC_EGINEERED);
  const treated = watch(TREATED);

  const disabled = !(
    (organicSelection === 'false' &&
      commAvail &&
      geneticEngineered &&
      (treated === 'true' || treated === 'false' || treated === 'null')) ||
    (organicSelection === 'true' &&
      (treated === 'true' || treated === 'false' || treated === 'null'))
  );

  const prevPage = useSelector(newVarietalSelector);

  const crop_id = match.params.crop_id;
  const isNewCrop = crop_id === 'new';
  const newCropInfo = useSelector(hookFormPersistSelector);

  const onError = (err) => {
    console.log(err);
  };

  const onSubmit = (data) => {
    let newVarietal = {};
    newVarietal.crop_variety_name = prevPage.crop_variety_name;
    newVarietal.supplier = prevPage.supplier;
    newVarietal.seed_type = prevPage.seed_type;
    newVarietal.lifecycle = prevPage.lifecycle;
    newVarietal.compliance_file_url = '';
    newVarietal.organic = data.organic === 'true';
    newVarietal.treated = data.treated === 'null' ? null : data.treated === 'true';
    newVarietal.genetically_engineered =
      data.genetically_engineered !== undefined ? data.genetically_engineered === 'true' : null;
    newVarietal.searched = data.searched !== undefined ? data.searched === 'true' : null;
    if (isNewCrop) {
      dispatch(postCropAndVarietal({ crop: newCropInfo, variety: newVarietal }));
    } else {
      newVarietal.crop_id = Number(crop_id);
      dispatch(postVarietal(newVarietal));
    }
    history.push(`/crop_catalogue`);
  };

  const onGoBack = () => {
    history.push(`/crop/${crop_id}/add_crop_variety`);
  };

  const onCancel = () => {
    history.push(`/crop_catalogue`);
    dispatch(deleteVarietal());
  };

  return (
    <>
      <ComplianceInfo
        history={history}
        disabled={disabled}
        onSubmit={handleSubmit(onSubmit, onError)}
        onGoBack={onGoBack}
        onCancel={onCancel}
        organicRegister={organicRegister}
        organic={organicSelection}
        commAvailRegister={commAvailRegister}
        geneticEngRegister={geneticEngRegister}
        treatedRegister={treatedRegister}
      />
    </>
  );
}

export default ComplianceInfoForm;
