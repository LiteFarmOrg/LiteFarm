import { useSelector } from 'react-redux';
import { selectedCertificationSelector } from '../organicCertifierSurveySlice';
import { certifierSurveySelector } from '../slice';
import PureViewSupportedCertification from '../../../components/ViewCertification/PureViewSupportedCertification';
import PureViewUnsupportedCertification from '../../../components/ViewCertification/PureViewUnsupportedCertification';
import PureViewNotInterestedInCertification from '../../../components/ViewCertification/PureViewNotInterestedInCertification';

import { certifiersByCertificationSelector, certifierSelector } from '../certifierSlice';

export default function ViewCertification({ history }) {
  const { interested } = useSelector(certifierSurveySelector);

  const certification = useSelector(selectedCertificationSelector);

  const allSupportedCertifierTypes = useSelector(
    certifiersByCertificationSelector(certification.certification_id),
  );
  const isNotSupported =
    certification.certificationName === 'Other' || allSupportedCertifierTypes.length < 1;
  const onExport = () => {};
  const onAddCertification = () => history.push('/certification/interested_in_organic');
  const onChangePreference = onAddCertification;

  // todo: audrey added these props for certifier and certifications for supported and unsupported certification selections
  const unsupportedCertification = {};
  const unsupportedCertifier = {};
  const supportedCertification = {};
  const supportedCertifier = {};

  const certifier = useSelector(certifierSelector);

  return (
    <>
      {!interested ? (
        <PureViewNotInterestedInCertification onAddCertification={onAddCertification} />
      ) : isNotSupported ? (
        <PureViewUnsupportedCertification
          onExport={onExport}
          onChangeCertificationPreference={onChangePreference}
          unsupportedCertification={unsupportedCertification}
          unsupportedCertifier={unsupportedCertifier}
        />
      ) : (
        <PureViewSupportedCertification
          onExport={onExport}
          onChangeCertificationPreference={onChangePreference}
          supportedCertification={supportedCertification}
          supportedCertifier={supportedCertifier}
        />
      )}
    </>
  );
}
