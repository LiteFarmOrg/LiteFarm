import { useSelector } from 'react-redux';
import {
  allCertificationTypesSelector,
  allCertifierTypesSelector,
  requestedCertifierSelector,
  selectedCertificationSelector,
  selectedCertifierSelector,
} from '../organicCertifierSurveySlice';
import { certifierSurveySelector } from '../slice';
import { PureViewNotInterestedInCertification } from '../../../components/ViewCertification/PureViewNotInterestedInCertification';
import { PureViewUnsupportedCertification } from '../../../components/ViewCertification/PureViewUnsupportedCertification';
import { PureViewSupportedCertification } from '../../../components/ViewCertification/PureViewSupportedCertification';

export default function ViewCertification({ history }) {
  const { interested } = useSelector(certifierSurveySelector);
  const certifierType = useSelector(selectedCertifierSelector);
  const requestedCertifierData = useSelector(requestedCertifierSelector);
  const certificationType = useSelector(selectedCertificationSelector);
  const allSupportedCertificationTypes = useSelector(allCertificationTypesSelector);
  const selectedCertificationTranslation = allSupportedCertificationTypes.find(
    (cert) => cert.certification_id === certificationType.certificationID,
  )?.certification_translation_key;
  const allSupportedCertifierTypes = useSelector(allCertifierTypesSelector);
  const isNotSupported =
    certificationType.certificationName === 'Other' || allSupportedCertifierTypes.length < 1;
  const onExport = () => {};
  const onAddCertification = () => history.push('/interested_in_organic');
  const onChangePreference = onAddCertification;

  return (
    <>
      {!interested ? (
        <PureViewNotInterestedInCertification
          onAddCertification={onAddCertification}
          onExport={onExport}
        />
      ) : isNotSupported ? (
        <PureViewUnsupportedCertification
          onChangePreference={onChangePreference}
          onExport={onExport}
        />
      ) : (
        <PureViewSupportedCertification
          onChangePreference={onChangePreference}
          onExport={onExport}
        />
      )}
    </>
  );
}
