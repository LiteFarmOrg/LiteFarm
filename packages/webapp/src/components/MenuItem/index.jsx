import React from 'react';
import PropTypes from 'prop-types';
import Card from '../Card';
import { Semibold } from '../Typography';
import { colors } from '../../assets/theme';

const MenuItem = ({
  color = 'secondary',
  label = 'Label',
  style = {},
  onClick = () => {},
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
        {label}
      </Semibold>
    </Card>
  );
};

MenuItem.propTypes = {
  color: PropTypes.oneOf(['secondary', 'active']),
  onClick: PropTypes.func,

  label: PropTypes.string,
  style: PropTypes.object,
};

export default MenuItem;
