import Form from '../Form';
import Button from '../Form/Button';
import Radio from '../Form/Radio';
import OverlayTooltip from '../Tooltip';
import { Title, Underlined, Main } from '../Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PureInterestedOrganic({
  title,
  paragraph,
  inputs = [{}, {}],
  onSubmit,
  onGoBack,
  underlined,
  content,
}) {
  const { t } = useTranslation();
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
      <Main style={{ marginBottom: '24px' }}>{paragraph}</Main>
      <Radio {...inputs[0]} defaultChecked={true} />
      <Radio style={{ marginBottom: '32px' }} {...inputs[1]} />
      <OverlayTooltip content={content} offset={8} eventDelay={0} placement={'bottom-start'}>
        <Underlined style={{ marginLeft: '-100px', transform: 'translateX(100px)' }}>
          {underlined}
        </Underlined>
      </OverlayTooltip>
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
