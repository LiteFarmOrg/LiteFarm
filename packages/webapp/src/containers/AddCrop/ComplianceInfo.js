import React from 'react';
import ComplianceInfo from '../../components/AddCrop/ComplianceInfo';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

function ComplianceInfoForm({ history, match }) {
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: {errors, isValid},
    } = useForm({
        mode: 'onChange',
        shouldUnregister: true,
    });

    const CERTIFIED_ORGANIC = 'certifiedOrganic';
    const NON_GMO = "nonGMO";
    const NON_TREATED = "nonTreated";

    const disabled = !isValid;

    const organicRegister = register(CERTIFIED_ORGANIC, {required: true});
    const gmoRegister = register(NON_GMO, {required: true});
    const treatedRegister = register(NON_TREATED, {required: true});

    const onSubmit = (data) => {
        console.log(data);
    }

    const onGoBack = () => {
        history.push(`/crop_add`);
    }

    return (
        <>
         <ComplianceInfo
            history={history}
            disabled={disabled}
            onSubmit= {handleSubmit(onSubmit)}
            onGoBack = {onGoBack}
            organicRegister={organicRegister}
            gmoRegister={gmoRegister}
            treatedRegister={treatedRegister} 
         />
        </>
    )
}

export default ComplianceInfoForm;