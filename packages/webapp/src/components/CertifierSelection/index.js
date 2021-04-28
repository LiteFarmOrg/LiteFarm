import Layout from '../Layout';
import Button from '../Form/Button';
import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Text, Title, Semibold, Underlined } from '../Typography';
import CertifierSelectionMenuItem from './CertifierSelectionMenu/CertiferSelectionMenuItem';
import Input from '../Form/Input';
import { useTranslation } from 'react-i18next';
import Infoi from '../Tooltip/Infoi';
import { useSelector } from "react-redux";
import { allCertificationTypesSelector } from "../../containers/OrganicCertifierSurvey/organicCertifierSurveySlice";

export default function PureCertifierSelectionScreen({
  allSupportedCertifiers,
  history,
  onBack,
  dispatch,
  onSubmit,
  selectedCertifier,
  certifierType,
  role_id,
  allSupportedCertificationTypes,
  certificationType,
}) {
  const { t } = useTranslation(['translation', 'common', 'certifications']);
  const [selectedCertifierId, setCertifier] = useState(null);
  const [filter, setFilter] = useState();
  const disabled = !selectedCertifierId;
  const isSearchable = allSupportedCertifiers.length >= 2;
  const selectedCertificationTranslation = allSupportedCertificationTypes.find(cert => cert.certification_id === certificationType.certificationID)?.certification_translation_key;
  const onFilterChange = (e) => {
    setFilter(e.target.value);
  };
  const onRequestCertifier = () => {
    dispatch(
      selectedCertifier({
        certifierName: null,
        isRequestingCertifier: true,
      }),
    );
    history.push('/requested_certifier');
  };
  const onSelectCertifier = (certifier_id, certifier_name) => {
    selectedCertifierId !== certifier_id && setCertifier(certifier_id);
    dispatch(
      selectedCertifier({
        certifierName: certifier_name,
        certifierID: certifier_id,
        isRequestingCertifier: false,
      }),
    );
  };

  useEffect(() => {
    if (certifierType) setCertifier(certifierType.certifierID);
  }, [certifierType]);

  const filteredCertifiers = useMemo(() => {
    return filter
      ? allSupportedCertifiers.filter(
          (certifier) =>
            certifier.certifier_name.toLowerCase().includes(filter?.toLowerCase()) ||
            certifier.certifier_acronym.toLowerCase().includes(filter?.toLowerCase()),
        )
      : allSupportedCertifiers;
  }, [filter]);
  return (
    <Layout
      hasWhiteBackground
      classes={{ footer: { position: 'fixed', maxWidth: '1024px' } }}
      buttonGroup={
        <>
          <Button onClick={onBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button onClick={onSubmit} fullLength disabled={disabled}>
            {t('common:PROCEED')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '16px' }}>{t('CERTIFICATION.CERTIFIER_SELECTION.TITLE')}</Title>
      <Semibold style={{ paddingBottom: '20px', fontSize: '16px', fontWeight: 'normal' }}>
        {t('CERTIFICATION.CERTIFICATION_SELECTION.SUBTITLE_ONE') +
          ' ' +
          t(`certifications:${selectedCertificationTranslation}`) +
          ' ' +
          t('CERTIFICATION.CERTIFICATION_SELECTION.SUBTITLE_TWO')}
      </Semibold>

      {isSearchable && (
        <Input
          style={{ marginBottom: '16px' }}
          placeholder={t('CERTIFICATION.INPUT_PLACEHOLDER')}
          isSearchBar={true}
          onChange={onFilterChange}
          value={filter}
        />
      )}
      {filteredCertifiers.map((certifier) => {
        return (
          <CertifierSelectionMenuItem
            style={{ marginBottom: '16px' }}
            certifierName={certifier.certifier_name + ' ' + '(' + certifier.certifier_acronym + ')'}
            color={
              selectedCertifier.isRequestingCertifier
                ? 'secondary'
                : selectedCertifierId === certifier.certifier_id
                ? 'active'
                : 'secondary'
            }
            onClick={() => onSelectCertifier(certifier.certifier_id, certifier.certifier_acronym)}
          />
        );
      })}
      <div style={{ paddingTop: '12px', paddingBottom: '12px' }}>
        <Text style={{ display: 'inline' }}>
          {t('CERTIFICATION.CERTIFIER_SELECTION.NOT_FOUND')}
        </Text>{' '}
        <Infoi
          style={{ transform: 'translateY(2px)' }}
          content={t('CERTIFICATION.CERTIFIER_SELECTION.INFO')}
        />
      </div>

      {role_id !== 3 && (
        <div
          style={{
            width: 'fit-content',
            fontSize: '16px',
            color: 'var(--iconActive)',
            lineHeight: '16px',
            cursor: 'pointer',
          }}
          onClick={onRequestCertifier}
        >
          + <Underlined>{t('CERTIFICATION.CERTIFIER_SELECTION.REQUEST_CERTIFIER')}</Underlined>
        </div>
      )}
    </Layout>
  );
}

PureCertifierSelectionScreen.prototype = {
  allSupportedCertifiers: PropTypes.arrayOf(
    PropTypes.exact({
      certifierTranslation: PropTypes.string,
      certifier_id: PropTypes.string,
    }),
  ),
  history: PropTypes.object,
};
