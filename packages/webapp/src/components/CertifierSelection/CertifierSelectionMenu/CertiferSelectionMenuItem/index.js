import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../../Card';
import { Semibold } from '../../../Typography';
import { colors } from '../../../../assets/theme';

const CertifierSelectionMenuItem = ({
  color = 'secondary',
  certifierName = 'Certifier name',
  style,
  onClick,
  ...props
}) => {
  return (
    <Card
      color={color}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '63px',
        justifyContent: 'space-between',
        cursor: color === 'secondary' ? 'pointer' : 'default',
        padding: '8px 20px',
        alignItems: 'center',
        ...style,
      }}
      {...props}
    >
      <Semibold
        style={{
          marginBottom: 0,
          color: color === 'active' ? colors.teal900 : colors.grey900,
        }}
      >
        {certifierName}
      </Semibold>
    </Card>
  );
};

CertifierSelectionMenuItem.propTypes = {
  color: PropTypes.oneOf(['secondary', 'active']),
  onClick: PropTypes.func,

  certifierName: PropTypes.string,
  style: PropTypes.object,
};

export default CertifierSelectionMenuItem;
