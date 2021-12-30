import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from './hookFormPersistSlice';
import useHookFormPersist from './index';
import { motion, useAnimation } from 'framer-motion';
import history from '../../../history';

export function HookFormPersistProvider({ children }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const [hookFormPersistUnMountResolved, setHookFormPersistUnMountResolved] = useState(false);
  useEffect(() => {
    setHookFormPersistUnMountResolved(true);
  }, []);
  const controls = useAnimation();
  useEffect(() => {
    if (hookFormPersistUnMountResolved) {
      controls.start({
        opacity: 1,
        x: '0',
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      });
    }
  }, [hookFormPersistUnMountResolved]);


  const initial = { opacity: 0, x: history.action === 'POP' ? '-100%' : '100%' };
  return <motion.div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }} initial={initial}
                     animate={controls}>
    {hookFormPersistUnMountResolved && React.cloneElement(children, { persistedFormData, useHookFormPersist })}
  </motion.div>;
}
