import React, { useState, useEffect } from 'react';
import { retry } from 'redux-saga/effects';

export function Alert({ alertsUrl }) {
  // TODO initialize alertCount with the actual count of alerts for the user/farm
  const [alertCount, setAlertCount] = useState(0);
  const [retryCount, setRetryCount] = useState(3);

  useEffect(() => {
    let subscription = new EventSource(alertsUrl);

    subscription.onopen = () => {
      console.log(`server event stream opened: ${alertsUrl}`);
    };

    subscription.onerror = () => {
      console.log(`server event stream error; readyState = ${subscription.readyState}`);
      subscription.close();
      if (retryCount > 0) {
        console.log(
          `will attempt to re-open stream ${retryCount} more time${retryCount === 1 ? '' : 's'}.`,
        );
        setRetryCount((prev) => prev - 1);
        subscription = new EventSource(alertsUrl);
      }
    };

    subscription.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      console.log('alert', alert);
      // if (alert.farm_id === farmId)
      setAlertCount((prev) => prev + alert.delta);
    };

    // Return a cleanup function to avoid memory leak.
    return () => {
      console.log('cleaning up event stream');
      subscription.close();
    };
  }, []);

  return (
    <div>
      {alertCount} alert{alertCount !== 1 && 's'}.
    </div>
  );
}
