import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import PureConsent from '../../components/Consent';
import { patchConsent } from './saga';
import { getUserFarms } from '../ChooseFarm/saga';
import PropTypes from 'prop-types';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { CONSENT_VERSION } from '../../util/constants';
import { userFarmLengthSelector, userFarmStatusSelector } from '../userFarmSlice';

const consentFiles = import.meta.glob('./locales/{en,es,de,fr,pt,hi,pa,ml,it}/consent.md', {
  eager: true,
});
const shortVersionFiles = import.meta.glob(
  './locales/{en,es,de,fr,pt,hi,pa,ml,it}/short-version.md',
  {
    eager: true,
  },
);

const getLocalizedFile = (files, language, fileName) => {
  const mdxModule = files[`./locales/${language}/${fileName}`] || files[`./locales/en/${fileName}`];
  return mdxModule.default;
};

function ConsentForm({ goForwardTo }) {
  const language = getLanguageFromLocalStorage();
  const dispatch = useDispatch();
  const hasUserFarms = useSelector(userFarmLengthSelector);
  const { loaded: farmsLoaded, loading: farmsLoading } = useSelector(userFarmStatusSelector);
  const forwardTo = goForwardTo ?? (!farmsLoaded || hasUserFarms ? '/farm_selection' : '/add_farm');
  useEffect(() => {
    // Load the farm list so a user with no farms goes straight to /add_farm
    if (!hasUserFarms && !farmsLoading) {
      dispatch(getUserFarms());
    }
  }, []);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const Consent = getLocalizedFile(consentFiles, language, 'consent.md');
  const ShortVersion = getLocalizedFile(shortVersionFiles, language, 'short-version.md');
  const checkboxName = 'consentCheckbox';
  const hasConsent = watch(checkboxName, false);
  const checkBoxRegister = register(checkboxName, {
    required: {
      value: true,
      message: 'You must accept terms and conditions to use the app',
    },
  });
  const updateConsent = () => {
    dispatch(patchConsent({ consent_version: CONSENT_VERSION, goForwardTo: forwardTo }));
  };

  return (
    <PureConsent
      checkboxArgs={{
        hookFormRegister: checkBoxRegister,
        errors: errors[checkboxName] && errors[checkboxName].message,
      }}
      onSubmit={handleSubmit(updateConsent)}
      shortVersion={<ShortVersion />}
      consent={<Consent />}
      disabled={!hasConsent}
    />
  );
}

export default ConsentForm;

ConsentForm.propTypes = {
  goForwardTo: PropTypes.string,
};
