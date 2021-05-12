import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PageBreak from '../../components/PageBreak';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import CropStatusInfoBox from '../../components/CropCatalogue/CropStatusInfoBox';
import { AddLink } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { cropSelector } from '../cropSlice';
import {
  cropVarietiesWithoutManagementPlanByCropIdSelector,
  currentFieldCropByCropIdSelector,
  expiredFieldCropByCropIdSelector,
  plannedFieldCropByCropIdSelector,
} from '../fieldCropSlice';
import useCropTileListGap from '../../components/CropTile/useCropTileListGap';
import PureCropTile from '../../components/CropTile';
import PureCropTileContainer from '../../components/CropTile/CropTileContainer';
import { useEffect, useState } from 'react';
import { getCropVarieties } from '../saga';
import MuiFullPagePopup from '../../components/MuiFullPagePopup/v2';
import { cropCatalogueFilterDateSelector, setCropCatalogueFilterDate } from '../filterSlice';
import { isAdminSelector } from '../userFarmSlice';
import useStringFilteredCrops from '../CropCatalogue/useStringFilteredCrops';

export default function CropVarieties({ history, match }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const dispatch = useDispatch();
  const { crop_id } = match.params;
  const crop = useSelector(cropSelector(crop_id));

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);

  const cropVarietiesWithoutManagementPlan = useStringFilteredCrops(
    useSelector(cropVarietiesWithoutManagementPlanByCropIdSelector(crop_id)),
    filterString,
  );
  const currentCropVarieties = useStringFilteredCrops(
    useSelector(currentFieldCropByCropIdSelector(crop_id)),
    filterString,
  );
  const plannedCropVarieties = useStringFilteredCrops(
    useSelector(plannedFieldCropByCropIdSelector(crop_id)),
    filterString,
  );
  const expiredCropVarieties = useStringFilteredCrops(
    useSelector(expiredFieldCropByCropIdSelector(crop_id)),
    filterString,
  );
  const { ref: containerRef, gap, padding, cardWidth } = useCropTileListGap([
    currentCropVarieties.length,
    plannedCropVarieties.length,
    expiredCropVarieties.length,
    cropVarietiesWithoutManagementPlan.length,
  ]);
  useEffect(() => {
    dispatch(getCropVarieties());
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const onFilterClose = () => {
    setIsFilterOpen(false);
  };
  const onFilterOpen = () => {
    setIsFilterOpen(true);
  };

  const date = useSelector(cropCatalogueFilterDateSelector);
  const setDate = (date) => dispatch(setCropCatalogueFilterDate(date));

  const onGoBack = () => history.push('/crop_catalogue');

  return (
    <Layout>
      <PageTitle
        title={`${t(`crop:${crop.crop_translation_key}`)} ${t('CROP_VARIETIES.CROP_VARIETIES')}`}
        style={{ paddingBottom: '20px' }}
        onGoBack={onGoBack}
      />
      <PureSearchbarAndFilter
        onFilterOpen={onFilterOpen}
        value={filterString}
        onChange={filterStringOnChange}
      />
      <MuiFullPagePopup open={isFilterOpen} onClose={onFilterClose}></MuiFullPagePopup>

      <CropStatusInfoBox style={{ marginBottom: '16px' }} date={date} setDate={setDate} />

      <div ref={containerRef}>
        {!!cropVarietiesWithoutManagementPlan.length && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('CROP_VARIETIES.NEEDS_PLAN')} />
            <PureCropTileContainer gap={gap} padding={padding}>
              {cropVarietiesWithoutManagementPlan.map((cropVariety) => {
                const { crop_translation_key, crop_variety_name } = cropVariety;
                const imageKey = crop_translation_key.toLowerCase();
                return (
                  <PureCropTile
                    key={crop_translation_key}
                    title={crop_variety_name || t(`crop:${crop_translation_key}`)}
                    src={`crop-images/${imageKey}.jpg`}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}

        {!!currentCropVarieties.length && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('common:ACTIVE')} />
            <PureCropTileContainer gap={gap} padding={padding}>
              {currentCropVarieties.map((cropVariety) => {
                const { crop_translation_key, crop_variety_name } = cropVariety;
                const imageKey = crop_translation_key.toLowerCase();
                return (
                  <PureCropTile
                    key={crop_translation_key}
                    title={crop_variety_name || t(`crop:${crop_translation_key}`)}
                    src={`crop-images/${imageKey}.jpg`}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}

        {!!plannedCropVarieties.length && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('common:PLANNED')} />
            <PureCropTileContainer gap={gap} padding={padding}>
              {plannedCropVarieties.map((cropVariety) => {
                const { crop_translation_key, crop_variety_name } = cropVariety;
                const imageKey = crop_translation_key.toLowerCase();
                return (
                  <PureCropTile
                    key={crop_translation_key}
                    title={crop_variety_name || t(`crop:${crop_translation_key}`)}
                    src={`crop-images/${imageKey}.jpg`}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}

        {!!expiredCropVarieties.length && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('common:PAST')} />
            <PureCropTileContainer gap={gap} padding={padding}>
              {expiredCropVarieties.map((cropVariety) => {
                const { crop_translation_key, crop_variety_name } = cropVariety;
                const imageKey = crop_translation_key.toLowerCase();
                return (
                  <PureCropTile
                    key={crop_translation_key}
                    title={crop_variety_name || t(`crop:${crop_translation_key}`)}
                    src={`crop-images/${imageKey}.jpg`}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    isPastVariety
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}
      </div>

      {isAdmin && <AddLink>{t('CROP_VARIETIES.ADD_VARIETY')}</AddLink>}
    </Layout>
  );
}
