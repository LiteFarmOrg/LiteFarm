import Layout from '../../Layout';
import Button from '../../Form/Button';
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AddLink, Semibold, Text } from '../../Typography';
import CertifierSelectionMenuItem from './CertifierSelectionMenu/CertiferSelectionMenuItem';
import Input from '../../Form/Input';
import { useTranslation } from 'react-i18next';
import Infoi from '../../Tooltip/Infoi';
import PageTitle from '../../PageTitle/v2';

export default function PureCertifierSelectionScreen({
  certifiers,
  history,
  onBack,
  onSubmit,
  certifier_id,
  certificationName,
  requestCertifier,
  selectCertifier,
}) {
  const { t } = useTranslation(['translation', 'common', 'certifications']);
  const [selectedCertifierId, setCertifier] = useState(certifier_id);
  const [filter, setFilter] = useState();
  const disabled = !selectedCertifierId;
  const isSearchable = certifiers.length >= 2;

  const onFilterChange = (e) => {
    setFilter(e.target.value);
  };
  const onRequestCertifier = () => {
    requestCertifier({
      certifierName: null,
      isRequestingCertifier: true,
    });
    history.push('/certification/certifier/request');
  };
  const onSelectCertifier = (certifier_id, certifier_name) => {
    selectedCertifierId !== certifier_id && setCertifier(certifier_id);
    selectCertifier({
      certifierName: certifier_name,
      certifierID: certifier_id,
      isRequestingCertifier: false,
    });
  };

  const filteredCertifiers = useMemo(() => {
    return filter
      ? certifiers.filter(
          (certifier) =>
            certifier.certifier_name.toLowerCase().includes(filter?.toLowerCase()) ||
            certifier.certifier_acronym.toLowerCase().includes(filter?.toLowerCase()),
        )
      : certifiers;
  }, [filter]);
  // console.log({  certifiers,
  //   history,
  //   onBack,
  //   onSubmit,
  //   certifierType,
  //   role_id,
  //   certifications,
  //   certificationType,
  //   requestCertifier,
  //   selectCertifier})
  return (
    <Layout
      hasWhiteBackground
      classes={{ footer: { position: 'fixed', maxWidth: '1024px' } }}
      buttonGroup={
        <>
          <Button onClick={onSubmit} fullLength disabled={disabled}>
            {t('common:PROCEED')}
          </Button>
        </>
      }
    >
      <PageTitle
        style={{ marginBottom: '16px' }}
        title={t('CERTIFICATION.CERTIFIER_SELECTION.TITLE')}
        onGoBack={onBack}
      />
      <Semibold style={{ paddingBottom: '20px', fontSize: '16px', fontWeight: 'normal' }}>
        {`${t('CERTIFICATION.CERTIFICATION_SELECTION.SUBTITLE_ONE')} ${certificationName} ${t(
          'CERTIFICATION.CERTIFICATION_SELECTION.SUBTITLE_TWO',
        )}`}
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
            key={certifier.certifier_id}
            style={{ marginBottom: '16px' }}
            certifierName={`${certifier.certifier_name} (${certifier.certifier_acronym})`}
            color={selectedCertifierId === certifier.certifier_id ? 'active' : 'secondary'}
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
      <AddLink onClick={onRequestCertifier}>
        {t('CERTIFICATION.CERTIFIER_SELECTION.REQUEST_CERTIFIER')}
      </AddLink>
    </Layout>
  );
}

PureCertifierSelectionScreen.prototype = {
  certifiers: PropTypes.arrayOf(
    PropTypes.exact({
      certifierTranslation: PropTypes.string,
      certifier_id: PropTypes.string,
    }),
  ),
  certifications: PropTypes.arrayOf(
    PropTypes.exact({
      certification_id: PropTypes.number,
      certifier_acronym: PropTypes.string,
      certifier_country_id: PropTypes.number,
      certifier_id: PropTypes.number,
      certifier_name: PropTypes.string,
      country_id: PropTypes.number,
    }),
  ),
  history: PropTypes.object,
  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
  certifierType: PropTypes.shape({
    certifierName: PropTypes.string,
    certifierID: PropTypes.number,
    isRequestingCertifier: PropTypes.bool,
  }),
  role_id: PropTypes.number,
  certificationType: PropTypes.shape({
    certificationName: PropTypes.string,
    certification_id: PropTypes.number,
    requestedCertification: PropTypes.any,
  }),
  requestCertifier: PropTypes.func,
  selectCertifier: PropTypes.func,
};
