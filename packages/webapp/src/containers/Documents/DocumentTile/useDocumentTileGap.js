import { useComponentWidth } from '../../hooks/useComponentWidthHeight';
import { useEffect, useState } from 'react';

export default function useDocumentTileGap(numberOfCropTilesInEachContainer = []) {
  const { ref, width } = useComponentWidth();
  const [{ gap, padding }, setGap] = useState({});
  const cardWidth = 148;
  useEffect(() => {
    const minGap = 14;
    const getMinGap = (docCount) => {
      const numberOfGap = Math.floor((width - 1 - cardWidth) / (cardWidth + minGap));
      const numberOfCard = numberOfGap + 1;
      if (docCount < numberOfCard || numberOfCard <= 1) {
        return { gap: minGap, padding: 0 };
      } else if (numberOfCard === 2) {
        const gap = (width - 1 - numberOfCard * cardWidth) / numberOfGap;
        if (gap >= 48) {
          return { gap: gap / 2, padding: gap / 4 };
        } else {
          return { gap: gap, padding: 0 };
        }
      } else {
        let gap = Math.floor((width - 1 - numberOfCard * cardWidth) / numberOfGap);
        return { gap: gap, padding: 0 };
      }
    };

    setGap(
      numberOfCropTilesInEachContainer.reduce(
        ({ padding: maxPadding, gap: maxGap }, docCount) => {
          const { gap, padding } = getMinGap(docCount);
          return gap >= maxGap && padding >= maxPadding
            ? { gap, padding }
            : { padding: maxPadding, gap: maxGap };
        },
        { padding: 0, gap: 14 },
      ),
    );
  }, [width]);
  return { ref, gap, padding };
}
