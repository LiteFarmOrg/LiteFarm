import Form from '../Form';
import Button from '../Form/Button';
import Radio from '../Form/Radio';
import { Label, Main, Title } from '../Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PureWarningBox from '../WarningBox';
import Infoi from '../Tooltip/Infoi';

export default function PureInterestedOrganic({
  title,
  paragraph,
  inputs = [{}, {}],
  onSubmit,
  onGoBack,
  underlined,
  content,
}) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Form
      onSubmit={onSubmit}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <Title>{title}</Title>
      <PureWarningBox style={{ marginBottom: '24px' }}>
        <Label>{t('CERTIFICATION.WARNING')}</Label>
      </PureWarningBox>
      <Main style={{ marginBottom: '24px' }}>
        {paragraph}{' '}
        <Infoi placement={'bottom'} content={content} style={{ transform: 'translateY(2px)' }} />{' '}
      </Main>

      <Radio {...inputs[0]} defaultChecked={true} />
      <Radio style={{ marginBottom: '32px' }} {...inputs[1]} />
    </Form>
  );
}

PureInterestedOrganic.prototype = {
  onSubmit: PropTypes.func,
  inputs: PropTypes.arrayOf(
    PropTypes.exact({
      label: PropTypes.string,
      info: PropTypes.string,
      icon: PropTypes.node,
    }),
  ),
};
