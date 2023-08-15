import React from 'react';

export const stopEventPropagation = (syntheticEvent: React.SyntheticEvent) =>
  syntheticEvent.stopPropagation();
