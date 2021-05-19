import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PageBreak from '../../components/PageBreak';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import CropStatusInfoBox from '../../components/CropCatalogue/CropStatusInfoBox';
import { AddLink, Text } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { cropsSelector } from '../cropSlice';
import { cropsWithVarietyWithoutManagementPlanSelector } from '../fieldCropSlice';
import useCropTileListGap from '../../components/CropTile/useCropTileListGap';
import PureCropTile from '../../components/CropTile';
import PureCropTileContainer from '../../components/CropTile/CropTileContainer';
import { useEffect, useState } from 'react';
import { getCrops, getCropVarieties } from '../saga';
import MuiFullPagePopup from '../../components/MuiFullPagePopup/v2';
import CropCatalogueFilterPage from '../Filter/CropCatalogue';
import { cropCatalogueFilterDateSelector, setCropCatalogueFilterDate } from '../filterSlice';
import { isAdminSelector } from '../userFarmSlice';
import useCropCatalogue from './useCropCatalogue';
import useStringFilteredCrops from './useStringFilteredCrops';
import useSortByCropTranslation from './useSortByCropTranslation';
import { resetAndUnLockFormData } from '../hooks/useHookFormPersist/hookFormPersistSlice';

export default function CropCatalogue({ history }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const dispatch = useDispatch();

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);
  const { active, planned, past, sum, cropCatalogue } = useCropCatalogue(filterString);
  const crops = useStringFilteredCrops(
    useSortByCropTranslation(useSelector(cropsSelector)),
    filterString,
  );
  const cropVarietiesWithoutManagementPlan = useStringFilteredCrops(
    useSortByCropTranslation(useSelector(cropsWithVarietyWithoutManagementPlanSelector)),
    filterString,
  );
  const { ref: containerRef, gap, padding, cardWidth } = useCropTileListGap([sum, crops.length]);
  useEffect(() => {
    dispatch(getCropVarieties());
    dispatch(getCrops());
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

  useEffect(() => {
    dispatch(resetAndUnLockFormData());
  }, []);

  return (
    <Layout>
      <PageTitle title={t('CROP_CATALOGUE.CROP_CATALOGUE')} style={{ paddingBottom: '20px' }} />
      <PureSearchbarAndFilter
        onFilterOpen={onFilterOpen}
        value={filterString}
        onChange={filterStringOnChange}
      />
      <MuiFullPagePopup open={isFilterOpen} onClose={onFilterClose}>
        <CropCatalogueFilterPage onGoBack={onFilterClose} />
      </MuiFullPagePopup>

      <div ref={containerRef}>
        {!!sum && (
          <>
            <PageBreak style={{ paddingBottom: '16px' }} label={t('CROP_CATALOGUE.ON_YOUR_FARM')} />
            <CropStatusInfoBox
              status={{ active, past, planned }}
              style={{ marginBottom: '16px' }}
              date={date}
              setDate={setDate}
            />
            <PureCropTileContainer gap={gap} padding={padding}>
              {cropVarietiesWithoutManagementPlan.map((cropVariety) => {
                const { crop_translation_key, crop_variety_photo_url } = cropVariety;
                const imageKey = cropVariety.crop_translation_key?.toLowerCase();
                return (
                  <PureCropTile
                    key={crop_translation_key}
                    title={t(`crop:${crop_translation_key}`)}
                    src={crop_variety_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => history.push(`/crop_varieties/crop/${cropVariety.crop_id}`)}
                    needsPlan
                  />
                );
              })}
              {cropCatalogue.map((cropCatalog) => {
                const {
                  crop_translation_key,
                  active,
                  planned,
                  past,
                  needsPlan,
                  imageKey,
                  crop_photo_url,
                } = cropCatalog;
                return (
                  <PureCropTile
                    key={crop_translation_key}
                    cropCount={{
                      active: active.length,
                      planned: planned.length,
                      past: past.length,
                    }}
                    needsPlan={needsPlan}
                    title={t(`crop:${crop_translation_key}`)}
                    src={crop_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => history.push(`/crop_varieties/crop/${cropCatalog.crop_id}`)}
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}
        {isAdmin && (
          <>
            {!!crops?.length && (
              <>
                <PageBreak
                  style={{ paddingBottom: '22px' }}
                  label={t('CROP_CATALOGUE.ADD_TO_YOUR_FARM')}
                />
                <PureCropTileContainer gap={gap} padding={padding}>
                  {crops.map((crop) => {
                    const { crop_translation_key } = crop;
                    const imageKey = crop_translation_key.toLowerCase();
                    return (
                      <PureCropTile
                        key={crop.crop_id}
                        title={t(`crop:${crop_translation_key}`)}
                        src={crop.crop_photo_url}
                        alt={imageKey}
                        style={{ width: cardWidth }}
                        isCropTemplate
                        onClick={() => {
                          history.push(`/crop/${crop.crop_id}/add_crop_variety`);
                        }}
                      />
                    );
                  })}
                </PureCropTileContainer>
              </>
            )}
            <Text style={{ paddingBottom: '8px' }}>{t('CROP_CATALOGUE.CAN_NOT_FIND')}</Text>
            <AddLink>{t('CROP_CATALOGUE.ADD_CROP')}</AddLink>
          </>
        )}
      </div>
    </Layout>
  );
}
