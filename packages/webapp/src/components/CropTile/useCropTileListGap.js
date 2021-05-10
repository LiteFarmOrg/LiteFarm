import { useComponentWidth } from '../../containers/hooks/useComponentWidthHeight';
import { useEffect, useState } from 'react';

export default function useCropTileListGap(numberOfCropTilesInEachContainer) {
  const { ref, width } = useComponentWidth();
  const [{ gap, padding }, setGap] = useState({});
  const cardWidth = 88;
  useEffect(() => {
    const minGap = 24;
    const getMinGap = (cropCount) => {
      const numberOfGap = Math.floor((width - cardWidth) / (cardWidth + minGap));
      const numberOfCard = numberOfGap + 1;
      if (cropCount < numberOfCard || numberOfCard <= 1) {
        return { gap: minGap, padding: 0 };
      } else if (numberOfCard === 2) {
        const gap = (width - numberOfCard * cardWidth) / numberOfGap;
        if (gap >= 48) {
          return { gap: gap / 2, padding: gap / 4 };
        } else {
          return { gap: gap, padding: 0 };
        }
      } else {
        return { gap: (width - numberOfCard * cardWidth) / numberOfGap, padding: 0 };
      }
    };

    setGap(
      numberOfCropTilesInEachContainer.reduce(
        ({ padding: maxPadding, gap: maxGap }, cropCount) => {
          const { gap, padding } = getMinGap(cropCount);
          return gap >= maxGap && padding >= maxPadding
            ? { gap, padding }
            : { padding: maxPadding, gap: maxGap };
        },
        { padding: 0, gap: 24 },
      ),
    );
  }, [numberOfCropTilesInEachContainer]);
  return { ref, gap, padding, cardWidth };
}
