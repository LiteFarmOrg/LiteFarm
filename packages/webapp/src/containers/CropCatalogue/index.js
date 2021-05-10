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

export default function CropCatalogue() {
  const { t } = useTranslation();
  const crops = useSelector(cropsSelector);
  const cropCatalogues = useSelector(cropCataloguesSelector);
  const { active, planned, past, sum } = useSelector(cropCataloguesStatusSelector);
  const { ref: containerRef, gap, padding, cardWidth } = useCropTileListGap([sum, crops.length]);

  return (
    <Layout>
      <PageTitle title={t('CROP_CATALOGUE.CROP_CATALOGUE')} />
      <PureSearchbarAndFilter />
      <PageBreak label={t('CROP_CATALOGUE.ON_YOUR_FARM')} />
      <CropStatusInfoBox active={active} past={past} planned={planned} />
      {!!sum && (
        <>
          <PageBreak
            style={{ paddingBottom: '22px' }}
            label={t('CROP_CATALOGUE.ADD_TO_YOUR_FARM')}
          />
        </>
      )}

      <Text>{t('CROP_CATALOGUE.ADD_TO_YOUR_FARM')}</Text>
      <AddLink>{t('CROP_CATALOGUE.ADD_CROP')}</AddLink>
    </Layout>
  );
}
