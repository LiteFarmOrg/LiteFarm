import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PureOutroSplash from '../../components/Outro';
import { patchOutroStep } from './saga';
import { showedSpotlightSelector } from '../showedSpotlightSlice';

function Outro() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { navigation } = useSelector(showedSpotlightSelector);
  const toShowSpotlight = !navigation;
  const onGoBack = () => {
    navigate('/consent');
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
