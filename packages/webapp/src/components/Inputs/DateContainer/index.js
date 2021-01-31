import React from 'react';
import Input from '../../Form/Input';
import moment from 'moment';
import { Text } from '../../Typography';
function DateContainer({ date, onDateChange, placeholder, defaultDate }) {
  const onChange = (e) => {
    onDateChange(moment(e.target.value));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'flex-row', width: '100%' }}>
      {placeholder && (
        <>
          <Text style={{ display: 'flex', alignItems: 'center', flexBasis: '35%', flexShrink: 0 }}>
            {placeholder}
          </Text>
          <div style={{ flexGrow: 1, flexBasis: '100%' }} />
        </>
      )}
      <Input
        value={!defaultDate ? date.format('YYYY-MM-DD') : defaultDate}
        type={'date'}
        onChange={onChange}
        style={{ flexGrow: 1 }}
      />
    </div>
  );
}

export default DateContainer;
