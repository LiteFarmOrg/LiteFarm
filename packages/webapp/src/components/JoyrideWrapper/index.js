import JoyrideTooltip from './JoyrideTooltip';
import Joyride, { STATUS } from 'react-joyride';
import React from 'react';

export default function JoyrideWrapper({ steps, onFinish, ...props }) {
  const callback = (data) => {
    if (STATUS.FINISHED === data.status) {
      onFinish();
    }
  };
  return (
    <Joyride
      steps={steps.map((step, index) => ({
        disableBeacon: true,
        disableCloseOnEsc: index !== steps.length - 1,
        ...step,
      }))}
      tooltipComponent={JoyrideTooltip}
      continuous
      floaterProps={{ disableAnimation: true }}
      styles={{
        options: {
          zIndex: 1100,
          overlayColor: 'rgba(25, 25, 40, 0.8)',
        },
        tooltip: {
          padding: '16px',
        },
      }}
      disableBeacon={true}
      spotlightPadding={12}
      callback={onFinish ? callback : props.callback}
      {...props}
    />
  );
}
