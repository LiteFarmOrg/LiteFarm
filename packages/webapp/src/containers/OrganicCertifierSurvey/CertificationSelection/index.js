import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import PureCertificationSelection from '../../../components/CertificationSelection';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSupportedCertifications, patchInterested, postCertifiers } from '../saga';
import history from '../../../history';
import { certifierSurveySelector } from '../slice';
import { useTranslation } from 'react-i18next';
import {
  setCertificationSelection,
  setCertificationSelectionSelector,
  setcertificationTypesSelector,
} from '../organicCertifierSurveySlice';

export default function CertificationSelection() {
  const dispatch = useDispatch();
  const selectedCertificationType = useSelector(setCertificationSelectionSelector);
  const certificationTypes = useSelector(setcertificationTypesSelector);

  useEffect(() => {
    dispatch(getAllSupportedCertifications());
  }, [dispatch]);

  //   const [disabled, setDisabled] = useState(survey.interested === undefined);
  //   const [interested, setInterested] = useState(survey.interested);

  //   useEffect(() => {
  //    console.log(selectedCertificationType)
  //   }, [selectedCertificationType]);

  //   const onSubmit = (data) => {
  //     const interested = data.interested === 'true';
  //     const callback = () =>
  //       interested ? history.push('/organic_partners') : history.push('/outro');
  //     if (survey.survey_id) {
  //       dispatch(patchInterested({ interested, callback }));
  //     } else {
  //       dispatch(postCertifiers({ survey: { interested }, callback }));
  //     }
  //   };
  const onGoBack = () => {
    history.push('/interested_in_organic');
  };

  //   const radioClick = (interested) => {
  //     if (!disabled) setDisabled(false);
  //     setInterested(interested)
  //   }

  return (
    <>
      <PureCertificationSelection
        // onSubmit={handleSubmit(onSubmit)}
        onGoBack={onGoBack}
        dispatch={dispatch}
        setCertificationSelection={setCertificationSelection}
        selectedCertificationType={selectedCertificationType}
        certificationTypes={certificationTypes}
        // disabled={disabled}
        // radioClick={radioClick}
        // inputs={[
        //   {
        //     label: t('common:YES'),
        //     inputRef: ref,
        //     name: INTERESTED,
        //     value: true,
        //   },
        //   {
        //     label: t('common:NO'),
        //     inputRef: ref,
        //     name: INTERESTED,
        //     value: false,
        //   },
        // ]}
      />
    </>
  );
}
