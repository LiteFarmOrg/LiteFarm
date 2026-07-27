import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import React, { useMemo } from 'react';
import { useHasCertifications } from '../../hooks/useHasCertifications';
import { TourProviderWrapper } from '../../components/TourProviderWrapper/TourProviderWrapper';

export default function DocumentsSpotlight() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { documents, compliance_docs_and_certification } = useSelector(showedSpotlightSelector);
  const hasCertifications = useHasCertifications();

  const steps = useMemo(() => {
    let steps = [];
    if (!documents)
      steps.push({
        title: t('DOCUMENTS.DOCUMENTS'),
        contents: [t('DOCUMENTS.SPOTLIGHT.HERE_YOU_CAN')],
        list: [
          t('DOCUMENTS.SPOTLIGHT.YOU_CAN_ONE'),
          t('DOCUMENTS.SPOTLIGHT.YOU_CAN_TWO'),
          t('DOCUMENTS.SPOTLIGHT.YOU_CAN_THREE'),
        ],
        position: 'center',
        flag: 'documents',
        onNext: () => dispatch(setSpotlightToShown('documents')),
      });
    if (!compliance_docs_and_certification && hasCertifications)
      steps.push({
        title: t('DOCUMENTS.COMPLIANCE_DOCUMENTS_AND_CERTIFICATION'),
        contents: [t('DOCUMENTS.SPOTLIGHT.CDC')],
        position: 'center',
        flag: 'compliance_docs_and_certification',
        onNext: () => dispatch(setSpotlightToShown('compliance_docs_and_certification')),
      });
    return steps;
  }, []);

  const showSpotlight = !documents || !compliance_docs_and_certification;

  return (
    <>
      {showSpotlight && (
        <TourProviderWrapper
          open={showSpotlight}
          onClickMask={({ setCurrentStep, currentStep, setIsOpen }) => {
            if (currentStep === steps.length - 1) {
              setIsOpen(false);
            }
            setCurrentStep((s) => (s === steps.length - 1 ? 0 : s + 1));
            dispatch(setSpotlightToShown(steps[currentStep].flag));
          }}
          steps={steps}
        >
          <></>
        </TourProviderWrapper>
      )}
    </>
  );
}
