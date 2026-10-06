import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import PureConsent from '../../components/Consent';
import { patchConsent } from './saga';
import PropTypes from 'prop-types';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { CONSENT_VERSION } from '../../util/constants';

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

function ConsentForm({ goBackTo = '/role_selection', goForwardTo = '/outro' }) {
  const navigate = useNavigate();
  const language = getLanguageFromLocalStorage();
  const dispatch = useDispatch();
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
  const goBack = () => {
    navigate(goBackTo);
  };

  const updateConsent = () => {
    dispatch(patchConsent({ has_consent: true, consent_version: CONSENT_VERSION, goForwardTo }));
  };

  return (
    <PureConsent
      checkboxArgs={{
        hookFormRegister: checkBoxRegister,
        errors: errors[checkboxName] && errors[checkboxName].message,
      }}
      onSubmit={handleSubmit(updateConsent)}
      onGoBack={goBackTo ? goBack : null}
      shortVersion={<ShortVersion />}
      consent={<Consent />}
      disabled={!hasConsent}
    />
  );
}

export default ConsentForm;

ConsentForm.propTypes = {
  goBackTo: PropTypes.string,
  goForwardTo: PropTypes.string,
};
