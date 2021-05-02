import { useMemo } from 'react';

export default function useDefaultOption(options, value) {
  return useMemo(() => {
    for (const option of options) {
      if (value === option.value) return option;
    }
  }, [value, options]);
}
