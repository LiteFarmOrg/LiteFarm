import { useDispatch, useSelector } from 'react-redux';
import PureOutroSplash from '../../components/Outro';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { patchOutroStep } from './saga';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { useNavigate } from 'react-router-dom';

function Outro() {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const survey = useSelector(certifierSurveySelector);
  const { navigation } = useSelector(showedSpotlightSelector);
  const toShowSpotlight = !navigation;
  const onGoBack = () => {
    navigate(!survey.interested ? '/certification/interested_in_organic' : 'certification/summary');
  };
  const onContinue = () => {
    dispatch(patchOutroStep());
  };

  return (
    <PureOutroSplash
      onGoBack={onGoBack}
      onContinue={onContinue}
      toShowSpotlight={toShowSpotlight}
    />
  );
}

export default Outro;
