import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PageBreak from '../../components/PageBreak';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import CropStatusInfoBox from '../../components/CropCatalogue/CropStatusInfoBox';
import { AddLink, Text } from '../../components/Typography';
import { useSelector } from 'react-redux';
import { cropsSelector } from '../cropSlice';
import { cropCataloguesSelector, cropCataloguesStatusSelector } from '../fieldCropSlice';
import useCropTileListGap from '../../components/CropTile/useCropTileListGap';
import PureCropTile from '../../components/CropTile';
import PureCropTileContainer from '../../components/CropTile/CropTileContainer';

export default function CropCatalogue() {
  const { t } = useTranslation();
  const crops = useSelector(cropsSelector);
  const cropCatalogues = useSelector(cropCataloguesSelector);
  const { active, planned, past, sum } = useSelector(cropCataloguesStatusSelector);
  const { ref: containerRef, gap, padding, cardWidth } = useCropTileListGap([sum, crops.length]);

  return (
    <Layout>
      <PageTitle title={t('CROP_CATALOGUE.CROP_CATALOGUE')} style={{ paddingBottom: '20px' }} />
      <PureSearchbarAndFilter />

      <div ref={containerRef}>
        {!!sum && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('CROP_CATALOGUE.ON_YOUR_FARM')} />
            <CropStatusInfoBox
              active={active}
              past={past}
              planned={planned}
              style={{ marginBottom: '16px' }}
            />
            <PureCropTileContainer gap={gap} padding={padding}>
              {cropCatalogues.map((cropCatalog) => {
                const { crop_translation_key, active, planned, past, imageKey } = cropCatalog;
                return (
                  <PureCropTile
                    key={crop_translation_key}
                    cropCount={{
                      active: active.length,
                      planned: planned.length,
                      past: past.length,
                    }}
                    title={t(`crop:${crop_translation_key}`)}
                    src={`crop-images/${imageKey}.jpg`}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}

        <PageBreak style={{ paddingBottom: '22px' }} label={t('CROP_CATALOGUE.ADD_TO_YOUR_FARM')} />
        <PureCropTileContainer gap={gap} padding={padding}>
          {crops.map((crop) => {
            const { crop_translation_key } = crop;
            const imageKey = crop_translation_key.toLowerCase();
            return (
              <PureCropTile
                key={crop_translation_key}
                title={t(`crop:${crop_translation_key}`)}
                src={`crop-images/${imageKey}.jpg`}
                alt={imageKey}
                style={{ width: cardWidth }}
              />
            );
          })}
        </PureCropTileContainer>
      </div>

      <Text style={{ paddingBottom: '8px' }}>{t('CROP_CATALOGUE.ADD_TO_YOUR_FARM')}</Text>
      <AddLink>{t('CROP_CATALOGUE.ADD_CROP')}</AddLink>
    </Layout>
  );
}
