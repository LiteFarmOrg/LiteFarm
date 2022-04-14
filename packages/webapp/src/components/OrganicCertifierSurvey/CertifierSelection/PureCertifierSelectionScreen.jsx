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

export function PureCertifierSelectionScreen({
  certifiers,
  onBack,
  onSubmit,
  certificationName,
  onRequestCertifier,
  onSelectCertifier,
  certifier_id,
}) {
  const { t } = useTranslation(['translation', 'common', 'certifications']);
  const [filter, setFilter] = useState();
  const disabled = !certifier_id;
  const isSearchable = certifiers.length >= 2;

  const onFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredCertifiers = useMemo(() => {
    const results = filter
      ? certifiers.filter(
          (certifier) =>
            certifier.certifier_name.toLowerCase().includes(filter?.toLowerCase()) ||
            certifier.certifier_acronym.toLowerCase().includes(filter?.toLowerCase()),
        )
      : certifiers;
    return results.sort((firstEl, secondEl) => firstEl.certifier_name.localeCompare(secondEl.certifier_name));
  }, [filter, certifiers]);

  return (
    <Layout
      hasWhiteBackground
      classes={{ footer: { position: 'fixed', maxWidth: '1024px' } }}
      buttonGroup={
        <>
          <Button data-cy='certifierSelection-proceed' onClick={onSubmit} fullLength disabled={disabled}>
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
            data-cy='certifierSelection-item'
            key={certifier.certifier_id}
            style={{ marginBottom: '16px' }}
            certifierName={`${certifier.certifier_name} (${certifier.certifier_acronym})`}
            color={certifier_id === certifier.certifier_id ? 'active' : 'secondary'}
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
  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
  certificationName: PropTypes.string,
  onRequestCertifier: PropTypes.func,
  onSelectCertifier: PropTypes.func,
  certifier_id: PropTypes.string,
};
