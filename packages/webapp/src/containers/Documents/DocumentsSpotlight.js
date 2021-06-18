import JoyrideWrapper from '../../components/JoyrideWrapper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import React, { useState } from 'react';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { LIFECYCLE } from 'react-joyride';

export default function DocumentsSpotlight() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { documents, compliance_docs_and_certification } = useSelector(showedSpotlightSelector);
  const { interested } = useSelector(certifierSurveySelector);
  const callback = (data) => {
    const { lifecycle } = data;
    if (lifecycle === LIFECYCLE.COMPLETE) {
      dispatch(setSpotlightToShown(data.step.flag));
    }
  };

  let initSteps = [];
  if (!documents)
    initSteps.push({
      title: t('DOCUMENTS.DOCUMENTS'),
      contents: [t('DOCUMENTS.SPOTLIGHT.HERE_YOU_CAN')],
      list: [
        t('DOCUMENTS.SPOTLIGHT.YOU_CAN_ONE'),
        t('DOCUMENTS.SPOTLIGHT.YOU_CAN_TWO'),
        t('DOCUMENTS.SPOTLIGHT.YOU_CAN_THREE'),
      ],
      target: 'body',
      placement: 'center',
      disableCloseOnEsc: true,
      buttonText: interested ? t('common:NEXT') : t('common:GOT_IT'),
      flag: 'documents',
    });
  if (!compliance_docs_and_certification && interested)
    initSteps.push({
      title: t('DOCUMENTS.COMPLIANCE_DOCUMENTS_AND_CERTIFICATION'),
      contents: [t('DOCUMENTS.SPOTLIGHT.CDC')],
      target: 'body',
      placement: 'center',
      disableCloseOnEsc: true,
      buttonText: t('common:GOT_IT'),
      flag: 'compliance_docs_and_certification',
    });
  const [steps] = useState(initSteps);

  const showSpotlight = !documents || !compliance_docs_and_certification;

  return <>{showSpotlight && <JoyrideWrapper steps={steps} callback={callback} />}</>;
}
