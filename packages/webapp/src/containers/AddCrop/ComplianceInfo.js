import React from 'react';
import ComplianceInfo from '../../components/AddCrop/ComplianceInfo';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { newVarietalSelector } from '../cropVarietySlice';

function ComplianceInfoForm({ history, match }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  const CERTIFIED_ORGANIC = 'certifiedOrganic';
  const COMMERCIAL_AVAILABILITY = 'commercialAvailability';
  const GENETIC_EGINEERED = 'geneticEngineered';
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
    (organicSelection === 'false' && commAvail && geneticEngineered && treated) ||
    (organicSelection === 'true' && treated)
  );

  //const gmoRegister = register(NON_GMO, {required: true});
  //const treatedRegister = register(NON_TREATED, {required: true});

  const onSubmit = (data) => {
    console.log(data);
  };

  const onGoBack = () => {
    history.push(`/crop/${match.params.crop_id}/add_crop_variety`);
  };

  const onCancel = () => {
    history.push(`/crop/${match.params.crop_id}/add_crop_variety`);
  };

  return (
    <>
      <ComplianceInfo
        history={history}
        disabled={disabled}
        onSubmit={handleSubmit(onSubmit)}
        onGoBack={onGoBack}
        onCancel={oncancel}
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
