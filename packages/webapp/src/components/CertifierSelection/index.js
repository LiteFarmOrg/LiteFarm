import Layout from '../Layout';
import Button from '../Form/Button';
import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Text, Title, Semibold, Underlined } from '../Typography';
import CertifierSelectionMenuItem from './CertifierSelectionMenu/CertiferSelectionMenuItem';
import Input from '../Form/Input';
import { useTranslation } from 'react-i18next';
import Infoi from '../Tooltip/Infoi';

export default function PureCertifierSelectionScreen({
  certifiers,
  history,
  onBack,
  isRequestingCertifier,
  dispatch,
  onSubmit,
  selectedCertifier,
  certifierSelected,
  isRequesting,
  role_id,
  certificationType,
}) {
  const { t } = useTranslation(['translation', 'common']);
  const [selectedCertifierId, setCertifier] = useState(null);
  const [filter, setFilter] = useState();
  const disabled = !selectedCertifierId;
  const isSearchable = certifiers.length >= 2;
  const onFilterChange = (e) => {
    setFilter(e.target.value);
  };
  const onRequestCertifier = () => {
    dispatch(isRequestingCertifier(true));
    history.push('/requested_certifier');
  };
  const onSelectCertifier = (certifier_id, certifier_name) => {
    selectedCertifierId !== certifier_id && setCertifier(certifier_id);
    dispatch(isRequestingCertifier(false));
    dispatch(
      selectedCertifier({
        certifier_id: certifier_id,
        certifier_name: certifier_name,
      }),
    );
  };

  useEffect(() => {
    if (certifierSelected) setCertifier(certifierSelected.certifier_id);
  }, [certifierSelected]);

  const filteredCertifiers = useMemo(() => {
    return filter
      ? certifiers.filter(
          (certifier) =>
            certifier.certifier_name.toLowerCase().includes(filter?.toLowerCase()) ||
            certifier.certifier_acronym.toLowerCase().includes(filter?.toLowerCase()),
        )
      : certifiers;
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
      <Semibold style={{ paddingBottom: '20px' }}>
        {t('CERTIFICATION.CERTIFICATION_SELECTION.SUBTITLE_ONE') +
          ' ' +
          certificationType +
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
              isRequesting
                ? 'secondary'
                : selectedCertifierId === certifier.certifier_id
                ? 'active'
                : 'secondary'
            }
            onClick={() => onSelectCertifier(certifier.certifier_id, certifier.certifier_name)}
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
  certifiers: PropTypes.arrayOf(
    PropTypes.exact({
      certifierTranslation: PropTypes.string,
      certifier_id: PropTypes.string,
    }),
  ),
  history: PropTypes.object,
};
