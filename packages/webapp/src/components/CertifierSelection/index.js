import Layout from '../Layout';
import Button from '../Form/Button';
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Text, Title, Underlined } from '../Typography';
import CertifierSelectionMenuItem from './CertifierSelectionMenu/CertiferSelectionMenuItem';
import Input from '../Form/Input';
import { useTranslation } from 'react-i18next';
import Infoi from '../Tooltip/Infoi';

export default function PureCertifierSelectionScreen({ certifiers = [], history }) {
  const { t } = useTranslation(['translation', 'common']);
  const [selectedCertifierId, setCertifier] = useState();
  const [filter, setFilter] = useState();
  const onGoBack = () => {};
  const onProceed = () => {};
  const disabled = !selectedCertifierId;
  const isSearchable = certifiers.length >= 2;
  const onFilterChange = (e) => {
    setFilter(e.target.value);
  };
  const onRequestCertifier = () => {};
  const onSelectCertifier = (certifier_id) => {
    selectedCertifierId !== certifier_id && setCertifier(certifier_id);
  };

  const filteredCertifiers = useMemo(() => {
    return filter
      ? certifiers.filter((certifier) =>
          certifier.certifierTranslation.toLowerCase().includes(filter?.toLowerCase()),
        )
      : certifiers;
  }, [filter]);
  return (
    <Layout
      hasWhiteBackground
      classes={{ footer: { position: 'fixed', maxWidth: '1024px' } }}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button onClick={onProceed} fullLength disabled={disabled}>
            {t('common:PROCEED')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '16px' }}>{t('CERTIFICATION.CERTIFIER_SELECTION.TITLE')}</Title>

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
            certifierName={certifier.certifierTranslation}
            color={selectedCertifierId === certifier.certifier_id ? 'active' : 'secondary'}
            onClick={() => onSelectCertifier(certifier.certifier_id)}
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
  history: PropTypes.object,
};
